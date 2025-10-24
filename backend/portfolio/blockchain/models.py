from django.db import models
from django.contrib.auth.models import User
from decimal import Decimal
import hashlib
import json
from datetime import datetime

class BlockchainTransaction(models.Model):
    """Represents a transaction on the blockchain"""
    TRANSACTION_TYPES = [
        ('FUNDING', 'MSME Funding'),
        ('INVESTMENT', 'Investment'),
        ('REPAYMENT', 'Loan Repayment'),
        ('DIVIDEND', 'Dividend Payment'),
        ('TOKEN_TRANSFER', 'Token Transfer'),
        ('CONTRACT_DEPLOY', 'Smart Contract Deployment'),
    ]
    
    transaction_hash = models.CharField(max_length=64, unique=True)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    from_address = models.CharField(max_length=42)  # Ethereum-style address
    to_address = models.CharField(max_length=42)
    amount = models.DecimalField(max_digits=20, decimal_places=8)
    gas_used = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    block_number = models.PositiveIntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='PENDING')
    data = models.JSONField(default=dict)  # Additional transaction data
    
    def __str__(self):
        return f"{self.transaction_type} - {self.transaction_hash[:10]}..."
    
    def save(self, *args, **kwargs):
        if not self.transaction_hash:
            self.transaction_hash = self.generate_hash()
        super().save(*args, **kwargs)
    
    def generate_hash(self):
        """Generate a unique transaction hash"""
        data = f"{self.transaction_type}{self.from_address}{self.to_address}{self.amount}{datetime.now().timestamp()}"
        return hashlib.sha256(data.encode()).hexdigest()

class SmartContract(models.Model):
    """Represents a smart contract on the blockchain"""
    CONTRACT_TYPES = [
        ('MSME_FUNDING', 'MSME Funding Contract'),
        ('INVESTMENT_POOL', 'Investment Pool Contract'),
        ('ESCROW', 'Escrow Contract'),
        ('GOVERNANCE', 'Governance Contract'),
    ]
    
    contract_address = models.CharField(max_length=42, unique=True)
    contract_type = models.CharField(max_length=20, choices=CONTRACT_TYPES)
    name = models.CharField(max_length=100)
    description = models.TextField()
    owner_address = models.CharField(max_length=42)
    deployed_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    abi = models.JSONField()  # Contract ABI
    bytecode = models.TextField()  # Contract bytecode
    
    def __str__(self):
        return f"{self.name} ({self.contract_address[:10]}...)"

class Token(models.Model):
    """Represents a token on the blockchain"""
    TOKEN_TYPES = [
        ('MSME_TOKEN', 'MSME Token'),
        ('INVESTMENT_TOKEN', 'Investment Token'),
        ('GOVERNANCE_TOKEN', 'Governance Token'),
        ('REWARD_TOKEN', 'Reward Token'),
    ]
    
    token_address = models.CharField(max_length=42, unique=True)
    name = models.CharField(max_length=100)
    symbol = models.CharField(max_length=10)
    token_type = models.CharField(max_length=20, choices=TOKEN_TYPES)
    total_supply = models.DecimalField(max_digits=30, decimal_places=8)
    decimals = models.PositiveIntegerField(default=18)
    owner_address = models.CharField(max_length=42)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.name} ({self.symbol})"

class TokenBalance(models.Model):
    """Represents token balances for addresses"""
    address = models.CharField(max_length=42)
    token = models.ForeignKey(Token, on_delete=models.CASCADE)
    balance = models.DecimalField(max_digits=30, decimal_places=8, default=0)
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('address', 'token')
    
    def __str__(self):
        return f"{self.address[:10]}... - {self.token.symbol}: {self.balance}"

class MSMEFundingContract(models.Model):
    """Smart contract for MSME funding"""
    contract = models.OneToOneField(SmartContract, on_delete=models.CASCADE)
    msme = models.ForeignKey('MSME', on_delete=models.CASCADE)
    funding_amount = models.DecimalField(max_digits=20, decimal_places=8)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2)
    term_months = models.PositiveIntegerField()
    funded_amount = models.DecimalField(max_digits=20, decimal_places=8, default=0)
    repaid_amount = models.DecimalField(max_digits=20, decimal_places=8, default=0)
    status = models.CharField(max_length=20, default='PENDING')
    funded_at = models.DateTimeField(null=True, blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Funding for {self.msme.business_name} - {self.funding_amount}"
    
    def is_fully_funded(self):
        return self.funded_amount >= self.funding_amount
    
    def remaining_amount(self):
        return self.funding_amount - self.funded_amount
    
    def repayment_progress(self):
        if self.funded_amount == 0:
            return 0
        return (self.repaid_amount / self.funded_amount) * 100

class InvestmentPool(models.Model):
    """Investment pool for portfolio management"""
    contract = models.OneToOneField(SmartContract, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    description = models.TextField()
    target_amount = models.DecimalField(max_digits=20, decimal_places=8)
    current_amount = models.DecimalField(max_digits=20, decimal_places=8, default=0)
    min_investment = models.DecimalField(max_digits=20, decimal_places=8)
    max_investment = models.DecimalField(max_digits=20, decimal_places=8)
    token = models.ForeignKey(Token, on_delete=models.CASCADE, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.name} - {self.current_amount}/{self.target_amount}"
    
    def funding_progress(self):
        if self.target_amount == 0:
            return 0
        return (self.current_amount / self.target_amount) * 100

class DecentralizedIdentity(models.Model):
    """Decentralized identity for users and entities"""
    IDENTITY_TYPES = [
        ('MSME', 'MSME Identity'),
        ('INVESTOR', 'Investor Identity'),
        ('EXPERT', 'Business Expert Identity'),
        ('VALIDATOR', 'Validator Identity'),
    ]
    
    did = models.CharField(max_length=100, unique=True)  # Decentralized Identifier
    identity_type = models.CharField(max_length=20, choices=IDENTITY_TYPES)
    public_key = models.CharField(max_length=130)  # Public key for verification
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    msme = models.ForeignKey('MSME', on_delete=models.CASCADE, null=True, blank=True)
    expert = models.ForeignKey('BusinessGrowthExpert', on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)
    verification_data = models.JSONField(default=dict)
    
    def __str__(self):
        return f"{self.identity_type} - {self.did[:20]}..."
    
    def generate_did(self):
        """Generate a decentralized identifier"""
        if not self.did:
            data = f"{self.identity_type}{self.public_key}{datetime.now().timestamp()}"
            self.did = f"did:portfolio:{hashlib.sha256(data.encode()).hexdigest()[:32]}"
        return self.did 