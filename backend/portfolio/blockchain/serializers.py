from rest_framework import serializers
from .models import (
    BlockchainTransaction, SmartContract, Token, TokenBalance,
    MSMEFundingContract, InvestmentPool, DecentralizedIdentity
)

class BlockchainTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlockchainTransaction
        fields = '__all__'

class SmartContractSerializer(serializers.ModelSerializer):
    class Meta:
        model = SmartContract
        fields = '__all__'

class TokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Token
        fields = '__all__'

class TokenBalanceSerializer(serializers.ModelSerializer):
    token_symbol = serializers.CharField(source='token.symbol', read_only=True)
    token_name = serializers.CharField(source='token.name', read_only=True)
    
    class Meta:
        model = TokenBalance
        fields = '__all__'

class MSMEFundingContractSerializer(serializers.ModelSerializer):
    msme_name = serializers.CharField(source='msme.business_name', read_only=True)
    msme_code = serializers.CharField(source='msme.msme_code', read_only=True)
    contract_address = serializers.CharField(source='contract.contract_address', read_only=True)
    remaining_amount = serializers.ReadOnlyField()
    is_fully_funded = serializers.ReadOnlyField()
    repayment_progress = serializers.ReadOnlyField()
    
    class Meta:
        model = MSMEFundingContract
        fields = '__all__'

class InvestmentPoolSerializer(serializers.ModelSerializer):
    contract_address = serializers.CharField(source='contract.contract_address', read_only=True)
    funding_progress = serializers.ReadOnlyField()
    
    class Meta:
        model = InvestmentPool
        fields = '__all__'

class DecentralizedIdentitySerializer(serializers.ModelSerializer):
    entity_name = serializers.SerializerMethodField()
    
    class Meta:
        model = DecentralizedIdentity
        fields = '__all__'
    
    def get_entity_name(self, obj):
        if obj.msme:
            return obj.msme.business_name
        elif obj.expert:
            return obj.expert.name
        elif obj.user:
            return obj.user.username
        return None 