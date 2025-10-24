import hashlib
import json
from decimal import Decimal
from datetime import datetime, timedelta
from django.db import transaction
from .models import (
    BlockchainTransaction, SmartContract, Token, TokenBalance,
    MSMEFundingContract, InvestmentPool, DecentralizedIdentity
)

class BlockchainService:
    """Service for blockchain operations"""
    
    @staticmethod
    def generate_address():
        """Generate a unique blockchain address"""
        import secrets
        return f"0x{secrets.token_hex(20)}"
    
    @staticmethod
    def create_transaction(transaction_type, from_address, to_address, amount, data=None):
        """Create a new blockchain transaction"""
        tx = BlockchainTransaction.objects.create(
            transaction_type=transaction_type,
            from_address=from_address,
            to_address=to_address,
            amount=amount,
            block_number=BlockchainService.get_current_block_number(),
            data=data or {}
        )
        return tx
    
    @staticmethod
    def get_current_block_number():
        """Get current block number (simulated)"""
        return BlockchainTransaction.objects.count() + 1000
    
    @staticmethod
    def deploy_smart_contract(contract_type, name, description, owner_address, abi, bytecode):
        """Deploy a smart contract"""
        contract_address = BlockchainService.generate_address()
        
        contract = SmartContract.objects.create(
            contract_address=contract_address,
            contract_type=contract_type,
            name=name,
            description=description,
            owner_address=owner_address,
            abi=abi,
            bytecode=bytecode
        )
        
        # Create deployment transaction
        BlockchainService.create_transaction(
            'CONTRACT_DEPLOY',
            owner_address,
            contract_address,
            Decimal('0'),
            {'contract_type': contract_type, 'name': name}
        )
        
        return contract
    
    @staticmethod
    def create_token(name, symbol, token_type, total_supply, owner_address, decimals=18):
        """Create a new token"""
        token_address = BlockchainService.generate_address()
        
        token = Token.objects.create(
            token_address=token_address,
            name=name,
            symbol=symbol,
            token_type=token_type,
            total_supply=total_supply,
            decimals=decimals,
            owner_address=owner_address
        )
        
        # Create initial balance for owner
        TokenBalance.objects.create(
            address=owner_address,
            token=token,
            balance=total_supply
        )
        
        return token
    
    @staticmethod
    def transfer_tokens(from_address, to_address, token_address, amount):
        """Transfer tokens between addresses"""
        try:
            token = Token.objects.get(token_address=token_address)
            from_balance = TokenBalance.objects.get(address=from_address, token=token)
            to_balance, created = TokenBalance.objects.get_or_create(
                address=to_address,
                token=token,
                defaults={'balance': Decimal('0')}
            )
            
            if from_balance.balance < amount:
                raise ValueError("Insufficient balance")
            
            with transaction.atomic():
                from_balance.balance -= amount
                from_balance.save()
                
                to_balance.balance += amount
                to_balance.save()
                
                # Create transfer transaction
                BlockchainService.create_transaction(
                    'TOKEN_TRANSFER',
                    from_address,
                    to_address,
                    amount,
                    {'token_address': token_address, 'token_symbol': token.symbol}
                )
            
            return True
        except (Token.DoesNotExist, TokenBalance.DoesNotExist):
            return False
    
    @staticmethod
    def get_token_balance(address, token_address):
        """Get token balance for an address"""
        try:
            token = Token.objects.get(token_address=token_address)
            balance = TokenBalance.objects.get(address=address, token=token)
            return balance.balance
        except (Token.DoesNotExist, TokenBalance.DoesNotExist):
            return Decimal('0')

class MSMEFundingService:
    """Service for MSME funding operations"""
    
    @staticmethod
    def create_funding_contract(msme, funding_amount, interest_rate, term_months):
        """Create a funding contract for an MSME"""
        # Create smart contract
        contract_abi = MSMEFundingService.get_funding_contract_abi()
        contract_bytecode = MSMEFundingService.get_funding_contract_bytecode()
        
        contract = BlockchainService.deploy_smart_contract(
            'MSME_FUNDING',
            f"Funding Contract - {msme.business_name}",
            f"Smart contract for funding {msme.business_name}",
            BlockchainService.generate_address(),  # Platform address
            contract_abi,
            contract_bytecode
        )
        
        # Create funding contract
        funding_contract = MSMEFundingContract.objects.create(
            contract=contract,
            msme=msme,
            funding_amount=funding_amount,
            interest_rate=interest_rate,
            term_months=term_months
        )
        
        return funding_contract
    
    @staticmethod
    def contribute_to_funding(funding_contract_id, investor_address, amount):
        """Contribute to MSME funding"""
        try:
            funding_contract = MSMEFundingContract.objects.get(id=funding_contract_id)
            
            if funding_contract.is_fully_funded():
                raise ValueError("Funding contract is already fully funded")
            
            if amount > funding_contract.remaining_amount():
                amount = funding_contract.remaining_amount()
            
            with transaction.atomic():
                funding_contract.funded_amount += amount
                if funding_contract.is_fully_funded():
                    funding_contract.status = 'FUNDED'
                    funding_contract.funded_at = datetime.now()
                    funding_contract.due_date = datetime.now() + timedelta(days=funding_contract.term_months * 30)
                funding_contract.save()
                
                # Create funding transaction
                BlockchainService.create_transaction(
                    'FUNDING',
                    investor_address,
                    funding_contract.contract.contract_address,
                    amount,
                    {
                        'msme_id': funding_contract.msme.id,
                        'msme_name': funding_contract.msme.business_name,
                        'funding_contract_id': funding_contract.id
                    }
                )
            
            return True
        except MSMEFundingContract.DoesNotExist:
            return False
    
    @staticmethod
    def process_repayment(funding_contract_id, repayment_amount):
        """Process loan repayment"""
        try:
            funding_contract = MSMEFundingContract.objects.get(id=funding_contract_id)
            
            with transaction.atomic():
                funding_contract.repaid_amount += repayment_amount
                if funding_contract.repaid_amount >= funding_contract.funded_amount:
                    funding_contract.status = 'REPAID'
                funding_contract.save()
                
                # Create repayment transaction
                BlockchainService.create_transaction(
                    'REPAYMENT',
                    funding_contract.msme.msme_code,  # Using MSME code as address
                    funding_contract.contract.contract_address,
                    repayment_amount,
                    {
                        'msme_id': funding_contract.msme.id,
                        'funding_contract_id': funding_contract.id
                    }
                )
            
            return True
        except MSMEFundingContract.DoesNotExist:
            return False
    
    @staticmethod
    def get_funding_contract_abi():
        """Get the ABI for MSME funding contract"""
        return [
            {
                "inputs": [
                    {"name": "msme_id", "type": "uint256"},
                    {"name": "funding_amount", "type": "uint256"},
                    {"name": "interest_rate", "type": "uint256"},
                    {"name": "term_months", "type": "uint256"}
                ],
                "name": "createFunding",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {"name": "investor", "type": "address"},
                    {"name": "amount", "type": "uint256"}
                ],
                "name": "contribute",
                "outputs": [],
                "stateMutability": "payable",
                "type": "function"
            }
        ]
    
    @staticmethod
    def get_funding_contract_bytecode():
        """Get the bytecode for MSME funding contract (simplified)"""
        return "0x608060405234801561001057600080fd5b506040516101a03803806101a08339818101604052602081101561003357600080fd5b8101908080519060200190929190505050806000819055505061014a8061005c6000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063a9059cbb1461003b578063d0e30db014610069575b600080fd5b6100676004803603604081101561005157600080fd5b810190808035906020019092919080359060200190929190505050610087565b005b6100856004803603602081101561007f57600080fd5b50356100a3565b005b6100a082826100b6565b50565b6100b38160008190555050565b50565b600081905091905056fea2646970667358221220a1b2c3d4e5f67890123456789012345678901234567890123456789012345678901264736f6c63430008000033"

class InvestmentPoolService:
    """Service for investment pool operations"""
    
    @staticmethod
    def create_investment_pool(name, description, target_amount, min_investment, max_investment):
        """Create a new investment pool"""
        # Create smart contract
        contract_abi = InvestmentPoolService.get_pool_contract_abi()
        contract_bytecode = InvestmentPoolService.get_pool_contract_bytecode()
        
        contract = BlockchainService.deploy_smart_contract(
            'INVESTMENT_POOL',
            f"Investment Pool - {name}",
            description,
            BlockchainService.generate_address(),
            contract_abi,
            contract_bytecode
        )
        
        # Create investment pool
        pool = InvestmentPool.objects.create(
            contract=contract,
            name=name,
            description=description,
            target_amount=target_amount,
            min_investment=min_investment,
            max_investment=max_investment
        )
        
        return pool
    
    @staticmethod
    def invest_in_pool(pool_id, investor_address, amount):
        """Invest in an investment pool"""
        try:
            pool = InvestmentPool.objects.get(id=pool_id)
            
            if amount < pool.min_investment:
                raise ValueError(f"Investment amount must be at least {pool.min_investment}")
            
            if amount > pool.max_investment:
                raise ValueError(f"Investment amount cannot exceed {pool.max_investment}")
            
            if pool.current_amount + amount > pool.target_amount:
                amount = pool.target_amount - pool.current_amount
            
            with transaction.atomic():
                pool.current_amount += amount
                pool.save()
                
                # Create investment transaction
                BlockchainService.create_transaction(
                    'INVESTMENT',
                    investor_address,
                    pool.contract.contract_address,
                    amount,
                    {
                        'pool_id': pool.id,
                        'pool_name': pool.name
                    }
                )
            
            return True
        except InvestmentPool.DoesNotExist:
            return False
    
    @staticmethod
    def get_pool_contract_abi():
        """Get the ABI for investment pool contract"""
        return [
            {
                "inputs": [
                    {"name": "name", "type": "string"},
                    {"name": "target_amount", "type": "uint256"},
                    {"name": "min_investment", "type": "uint256"},
                    {"name": "max_investment", "type": "uint256"}
                ],
                "name": "createPool",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {"name": "amount", "type": "uint256"}
                ],
                "name": "invest",
                "outputs": [],
                "stateMutability": "payable",
                "type": "function"
            }
        ]
    
    @staticmethod
    def get_pool_contract_bytecode():
        """Get the bytecode for investment pool contract (simplified)"""
        return "0x608060405234801561001057600080fd5b506040516101a03803806101a08339818101604052602081101561003357600080fd5b8101908080519060200190929190505050806000819055505061014a8061005c6000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063a9059cbb1461003b578063d0e30db014610069575b600080fd5b6100676004803603604081101561005157600080fd5b810190808035906020019092919080359060200190929190505050610087565b005b6100856004803603602081101561007f57600080fd5b50356100a3565b005b6100a082826100b6565b50565b6100b38160008190555050565b50565b600081905091905056fea2646970667358221220a1b2c3d4e5f67890123456789012345678901234567890123456789012345678901264736f6c63430008000033"

class DecentralizedIdentityService:
    """Service for decentralized identity operations"""
    
    @staticmethod
    def create_identity(identity_type, public_key, user=None, msme=None, expert=None):
        """Create a decentralized identity"""
        identity = DecentralizedIdentity.objects.create(
            identity_type=identity_type,
            public_key=public_key,
            user=user,
            msme=msme,
            expert=expert
        )
        
        # Generate DID
        identity.did = identity.generate_did()
        identity.save()
        
        return identity
    
    @staticmethod
    def verify_identity(did, signature, message):
        """Verify an identity signature"""
        # This is a simplified verification
        # In a real implementation, you'd use proper cryptographic verification
        try:
            identity = DecentralizedIdentity.objects.get(did=did)
            # For demo purposes, we'll just check if the identity exists
            return identity.is_verified
        except DecentralizedIdentity.DoesNotExist:
            return False
    
    @staticmethod
    def get_identity_by_entity(entity_type, entity_id):
        """Get identity by entity type and ID"""
        try:
            if entity_type == 'msme':
                return DecentralizedIdentity.objects.get(msme_id=entity_id)
            elif entity_type == 'expert':
                return DecentralizedIdentity.objects.get(expert_id=entity_id)
            elif entity_type == 'user':
                return DecentralizedIdentity.objects.get(user_id=entity_id)
        except DecentralizedIdentity.DoesNotExist:
            return None 