from django.contrib import admin
from .models import Portfolio, Investment, Transaction, MSME, BusinessGrowthExpert, SupportRequest

@admin.register(Portfolio)
class PortfolioAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'created_at', 'is_active', 'total_value_display')
    list_filter = ('is_active', 'created_at', 'user')
    search_fields = ('name', 'description', 'user__username')
    readonly_fields = ('created_at', 'updated_at')
    
    def total_value_display(self, obj):
        return f"${obj.total_value():,.2f}"
    total_value_display.short_description = 'Total Value'

@admin.register(Investment)
class InvestmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'symbol', 'portfolio', 'investment_type', 'current_price', 'shares_quantity', 'current_value_display')
    list_filter = ('investment_type', 'portfolio', 'created_at')
    search_fields = ('name', 'symbol', 'portfolio__name')
    readonly_fields = ('created_at', 'updated_at')
    
    def current_value_display(self, obj):
        return f"${obj.current_value():,.2f}"
    current_value_display.short_description = 'Current Value'

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('investment', 'transaction_type', 'amount', 'shares_quantity', 'price_per_share', 'transaction_date')
    list_filter = ('transaction_type', 'transaction_date', 'investment__portfolio')
    search_fields = ('investment__name', 'investment__symbol', 'notes')
    readonly_fields = ('created_at',)
    date_hierarchy = 'transaction_date'

@admin.register(MSME)
class MSMEAdmin(admin.ModelAdmin):
    list_display = ('business_name', 'business_type', 'sector', 'owner_name', 'city', 'annual_revenue_display', 'employee_count')
    list_filter = ('business_type', 'sector', 'city', 'state', 'is_active', 'created_at')
    search_fields = ('business_name', 'owner_name', 'email', 'phone', 'address')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Basic Information', {
            'fields': ('business_name', 'business_type', 'sector', 'registration_number')
        }),
        ('Contact Information', {
            'fields': ('owner_name', 'email', 'phone', 'address', 'city', 'state', 'country')
        }),
        ('Financial Information', {
            'fields': ('annual_revenue', 'employee_count', 'investment_needed', 'current_funding')
        }),
        ('Additional Information', {
            'fields': ('business_description', 'challenges', 'opportunities')
        }),
        ('Metadata', {
            'fields': ('is_active', 'source_file', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def annual_revenue_display(self, obj):
        if obj.annual_revenue:
            return f"UGX {obj.annual_revenue:,.2f}"
        return "N/A"
    annual_revenue_display.short_description = 'Annual Revenue (UGX)'

@admin.register(BusinessGrowthExpert)
class BusinessGrowthExpertAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'location', 'years_of_experience', 'created_at')
    search_fields = ('name', 'email', 'location')
    list_filter = ('location',)
    readonly_fields = ('created_at', 'updated_at')

@admin.register(SupportRequest)
class SupportRequestAdmin(admin.ModelAdmin):
    list_display = ('msme_name', 'business_need', 'location', 'latitude', 'longitude', 'created_at')
    search_fields = ('msme_name', 'business_need', 'location')
    list_filter = ('location',)
