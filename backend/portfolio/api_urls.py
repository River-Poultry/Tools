from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import (
    PortfolioViewSet, InvestmentViewSet, TransactionViewSet,
    MSMEViewSet, BusinessGrowthExpertViewSet, SupportRequestViewSet,
    TrainingSessionViewSet, AttendanceViewSet, TrainingTopicViewSet
)
from .auth_views import login_view, logout_view
from .blockchain.api_views import (
    BlockchainTransactionViewSet, SmartContractViewSet, TokenViewSet,
    MSMEFundingContractViewSet, InvestmentPoolViewSet, DecentralizedIdentityViewSet
)

router = DefaultRouter()
router.register(r'portfolios', PortfolioViewSet)
router.register(r'investments', InvestmentViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'msmes', MSMEViewSet)
router.register(r'experts', BusinessGrowthExpertViewSet)
router.register(r'support-requests', SupportRequestViewSet)
router.register(r'training-sessions', TrainingSessionViewSet)
router.register(r'attendance', AttendanceViewSet)
router.register(r'training-topics', TrainingTopicViewSet)

# Blockchain routes
router.register(r'blockchain/transactions', BlockchainTransactionViewSet)
router.register(r'blockchain/contracts', SmartContractViewSet)
router.register(r'blockchain/tokens', TokenViewSet)
router.register(r'blockchain/funding-contracts', MSMEFundingContractViewSet)
router.register(r'blockchain/investment-pools', InvestmentPoolViewSet)
router.register(r'blockchain/identities', DecentralizedIdentityViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/auth/login/', login_view, name='api_login'),
    path('api/auth/logout/', logout_view, name='api_logout'),
] 