from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse, HttpResponse
from django.core.paginator import Paginator
from .models import Portfolio, Investment, Transaction, MSME, BusinessGrowthExpert, SupportRequest
import pandas as pd
import os
from django.conf import settings
from datetime import datetime
from django.db import models
from django import forms
from django.utils.decorators import method_decorator
import io
from collections import Counter
from .forms import SupportRequestForm, BGEPublicSignupForm
from django.contrib.admin.views.decorators import staff_member_required
from django.db.models import Count

# Create your views here.

def home(request):
    """Home view for the portfolio dashboard"""
    # Get portfolio statistics
    portfolios = Portfolio.objects.all()
    investments = Investment.objects.all()
    transactions = Transaction.objects.all()
    
    # Calculate totals
    total_portfolios = portfolios.count()
    total_investments = investments.count()
    total_value = sum(portfolio.total_value() for portfolio in portfolios)
    total_cost = sum(portfolio.total_cost() for portfolio in portfolios)
    total_return = total_value - total_cost
    total_return_percentage = (total_return / total_cost * 100) if total_cost > 0 else 0
    
    # Get recent transactions
    recent_transactions = transactions.order_by('-transaction_date')[:5]
    
    # Get MSME statistics
    msmes = MSME.objects.filter(is_active=True)
    total_msmes = msmes.count()
    total_investment_needed = sum(msme.investment_needed or 0 for msme in msmes)
    total_annual_revenue = sum(msme.annual_revenue or 0 for msme in msmes)
    total_employees = sum(msme.employee_count or 0 for msme in msmes)
    
    # Calculate averages
    avg_revenue_per_msme = total_annual_revenue / total_msmes if total_msmes > 0 else 0
    avg_employees_per_msme = total_employees / total_msmes if total_msmes > 0 else 0
    
    # Business type distribution
    business_type_stats = {}
    for choice in MSME.BUSINESS_TYPES:
        count = msmes.filter(business_type=choice[0]).count()
        business_type_stats[choice[1]] = count
    # Sector distribution
    sector_stats = {}
    for choice in MSME.SECTORS:
        count = msmes.filter(sector=choice[0]).count()
        sector_stats[choice[1]] = count
    # Top cities
    top_cities = msmes.values('city').exclude(city='').annotate(
        count=models.Count('id')
    ).order_by('-count')[:10]
    
    # Get BGE statistics
    bges = BusinessGrowthExpert.objects.all()
    total_bges = bges.count()
    
    # BGE breakdowns
    bge_locations = [bge.location for bge in bges if bge.location]
    bge_skills = [bge.top_skills for bge in bges if bge.top_skills]
    bge_location_stats = Counter(bge_locations).most_common(5)
    bge_skill_stats = Counter(bge_skills).most_common(5)
    
    context = {
        'total_portfolios': total_portfolios,
        'total_investments': total_investments,
        'total_value': total_value,
        'total_return': total_return,
        'total_return_percentage': total_return_percentage,
        'recent_transactions': recent_transactions,
        'portfolios': portfolios,
        'total_msmes': total_msmes,
        'total_investment_needed': total_investment_needed,
        'total_annual_revenue': total_annual_revenue,
        'total_employees': total_employees,
        'avg_revenue_per_msme': avg_revenue_per_msme,
        'avg_employees_per_msme': avg_employees_per_msme,
        'business_type_stats': business_type_stats,
        'sector_stats': sector_stats,
        'top_cities': top_cities,
        'total_bges': total_bges,
        'bge_location_stats': bge_location_stats,
        'bge_skill_stats': bge_skill_stats,
    }
    
    return render(request, 'portfolio/home.html', context)

def msme_list(request):
    """Display list of MSMEs with filtering and search"""
    msmes = MSME.objects.filter(is_active=True)
    
    # Search functionality
    search_query = request.GET.get('search', '')
    if search_query:
        msmes = msmes.filter(
            models.Q(business_name__icontains=search_query) |
            models.Q(owner_name__icontains=search_query) |
            models.Q(sector__icontains=search_query) |
            models.Q(msme_code__icontains=search_query) |
            models.Q(city__icontains=search_query) |
            models.Q(state__icontains=search_query)
        )
    
    # Filtering
    business_type = request.GET.get('business_type', '')
    sector = request.GET.get('sector', '')
    
    if business_type:
        msmes = msmes.filter(business_type=business_type)
    if sector:
        msmes = msmes.filter(sector=sector)
    
    # Ordering
    msmes = msmes.order_by('-created_at')
    
    # Pagination
    paginator = Paginator(msmes, 25)  # Show 25 MSMEs per page
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    # For filter dropdowns
    business_types = MSME.BUSINESS_TYPES
    sectors = MSME.SECTORS
    
    context = {
        'page_obj': page_obj,
        'search_query': search_query,
        'business_type': business_type,
        'sector': sector,
        'business_types': business_types,
        'sectors': sectors,
    }
    
    return render(request, 'portfolio/msme_list.html', context)

def msme_detail(request, msme_id):
    """Display detailed information about a specific MSME"""
    try:
        msme = MSME.objects.get(id=msme_id, is_active=True)
    except MSME.DoesNotExist:
        messages.error(request, 'MSME not found.')
        return redirect('msme_list')
    
    context = {
        'msme': msme,
    }
    
    return render(request, 'portfolio/msme_detail.html', context)

def upload_msme_data(request):
    """Handle Excel file upload and data processing"""
    if request.method == 'POST':
        if 'excel_file' not in request.FILES:
            messages.error(request, 'Please select an Excel file to upload.')
            return redirect('upload_msme_data')
        
        excel_file = request.FILES['excel_file']
        
        if not excel_file.name.endswith(('.xlsx', '.xls')):
            messages.error(request, 'Please upload a valid Excel file (.xlsx or .xls)')
            return redirect('upload_msme_data')
        
        try:
            df = pd.read_excel(excel_file)
            success_count = 0
            error_count = 0
            
            for index, row in df.iterrows():
                try:
                    # Skip empty rows
                    if pd.isna(row.get('Business name', '')) or str(row.get('Business name', '')).strip() == '':
                        continue
                    
                    msme_data = {
                        'business_name': str(row.get('Business name', '')).strip(),
                        'state': str(row.get('Location', '')).strip(),
                        'city': str(row.get('Location', '')).strip(),
                        'owner_name': str(row.get('Owner name', '')).strip(),
                        'gender': str(row.get('Sex of founder', '')).strip().upper() if pd.notna(row.get('Sex of founder')) else '',
                        'phone': str(row.get('Phone number', '')).strip(),
                        'email': str(row.get('Email address of founder', '')).strip(),
                        'business_email': str(row.get('Business email', '')).strip(),
                        'sector': str(row.get('Industry', '')).strip(),
                        'business_type': str(row.get('Scale of business', '')).strip(),
                        'source_file': excel_file.name,
                        'country': 'Uganda',
                    }
                    
                    # Clean up gender field
                    if msme_data['gender'] in ['M', 'MALE']:
                        msme_data['gender'] = 'MALE'
                    elif msme_data['gender'] in ['F', 'FEMALE']:
                        msme_data['gender'] = 'FEMALE'
                    else:
                        msme_data['gender'] = 'OTHER'
                    
                    # Clean up business type field
                    business_type = msme_data['business_type'].upper()
                    if 'MICRO' in business_type:
                        msme_data['business_type'] = 'MICRO'
                    elif 'SMALL' in business_type:
                        msme_data['business_type'] = 'SMALL'
                    elif 'MEDIUM' in business_type:
                        msme_data['business_type'] = 'MEDIUM'
                    else:
                        msme_data['business_type'] = 'MICRO'
                    
                    # Clean up sector field
                    sector = msme_data['sector'].upper()
                    if 'MANUFACTURING' in sector:
                        msme_data['sector'] = 'MANUFACTURING'
                    elif 'SERVICE' in sector:
                        msme_data['sector'] = 'SERVICES'
                    elif 'TRADE' in sector:
                        msme_data['sector'] = 'TRADE'
                    elif any(word in sector for word in ['AGRICULTURE', 'FARM', 'AGRO']):
                        msme_data['sector'] = 'AGRICULTURE'
                    elif 'CONSTRUCTION' in sector:
                        msme_data['sector'] = 'CONSTRUCTION'
                    elif 'TECH' in sector:
                        msme_data['sector'] = 'TECHNOLOGY'
                    elif 'HEALTH' in sector:
                        msme_data['sector'] = 'HEALTHCARE'
                    elif 'EDUCATION' in sector:
                        msme_data['sector'] = 'EDUCATION'
                    else:
                        msme_data['sector'] = 'OTHER'
                    
                    # Create MSME if required fields are present
                    if msme_data['business_name'] and msme_data['owner_name']:
                        MSME.objects.create(**msme_data)
                        success_count += 1
                    else:
                        error_count += 1
                        
                except Exception as e:
                    error_count += 1
            
            messages.success(request, f'Successfully imported {success_count} MSME records. {error_count} errors occurred.')
        except Exception as e:
            messages.error(request, f'Error processing Excel file: {str(e)}')
        return redirect('msme_list')
    return render(request, 'portfolio/upload_msme.html')

def msme_analytics(request):
    """Display analytics and insights about MSME data"""
    msmes = MSME.objects.filter(is_active=True)
    
    # Basic statistics
    total_msmes = msmes.count()
    total_investment_needed = sum(msme.investment_needed or 0 for msme in msmes)
    total_annual_revenue = sum(msme.annual_revenue or 0 for msme in msmes)
    total_employees = sum(msme.employee_count or 0 for msme in msmes)
    
    # Business type distribution
    business_type_stats = {}
    for choice in MSME.BUSINESS_TYPES:
        count = msmes.filter(business_type=choice[0]).count()
        business_type_stats[choice[1]] = count
    
    # Sector distribution
    sector_stats = {}
    for choice in MSME.SECTORS:
        count = msmes.filter(sector=choice[0]).count()
        sector_stats[choice[1]] = count
    
    # Top cities
    top_cities = msmes.values('city').exclude(city='').annotate(
        count=models.Count('id')
    ).order_by('-count')[:10]
    
    context = {
        'total_msmes': total_msmes,
        'total_investment_needed': total_investment_needed,
        'total_annual_revenue': total_annual_revenue,
        'total_employees': total_employees,
        'business_type_stats': business_type_stats,
        'sector_stats': sector_stats,
        'top_cities': top_cities,
    }
    
    return render(request, 'portfolio/msme_analytics.html', context)

class MSMEForm(forms.ModelForm):
    class Meta:
        model = MSME
        fields = [
            'business_name', 'state', 'city', 'owner_name', 'gender', 
            'phone', 'email', 'business_email', 'sector', 'business_type',
            'annual_revenue', 'employee_count', 'investment_needed', 
            'current_funding', 'business_description', 'challenges', 
            'opportunities', 'address', 'country'
        ]
        exclude = ['created_at', 'updated_at', 'is_active', 'source_file']

@login_required
def msme_edit(request, msme_id):
    try:
        msme = MSME.objects.get(id=msme_id, is_active=True)
    except MSME.DoesNotExist:
        messages.error(request, 'MSME not found.')
        return redirect('msme_list')
    if request.method == 'POST':
        form = MSMEForm(request.POST, instance=msme)
        if form.is_valid():
            form.save()
            messages.success(request, 'MSME updated successfully.')
            return redirect('msme_detail', msme_id=msme.id)
    else:
        form = MSMEForm(instance=msme)
    return render(request, 'portfolio/msme_edit.html', {'form': form, 'msme': msme})

@login_required
def msme_delete(request, msme_id):
    if not request.user.is_superuser:
        messages.error(request, 'Only superusers can delete MSMEs.')
        return redirect('msme_detail', msme_id=msme_id)
    try:
        msme = MSME.objects.get(id=msme_id, is_active=True)
    except MSME.DoesNotExist:
        messages.error(request, 'MSME not found.')
        return redirect('msme_list')
    if request.method == 'POST':
        msme.delete()
        messages.success(request, 'MSME deleted successfully.')
        return redirect('msme_list')
    return render(request, 'portfolio/msme_confirm_delete.html', {'msme': msme})

def bge_list(request):
    bges = BusinessGrowthExpert.objects.all().order_by('-created_at')

    # Filtering
    location = request.GET.get('location', '')
    skill = request.GET.get('skill', '')
    search_query = request.GET.get('search', '')

    if location:
        bges = bges.filter(location__iexact=location)
    if skill:
        bges = bges.filter(top_skills__icontains=skill)
    if search_query:
        bges = bges.filter(
            models.Q(name__icontains=search_query) |
            models.Q(email__icontains=search_query) |
            models.Q(phone__icontains=search_query)
        )

    # For filter dropdowns
    all_locations = BusinessGrowthExpert.objects.exclude(location='').values_list('location', flat=True).distinct()
    all_skills = BusinessGrowthExpert.objects.exclude(top_skills='').values_list('top_skills', flat=True).distinct()

    return render(request, 'portfolio/bge_list.html', {
        'bges': bges,
        'all_locations': all_locations,
        'all_skills': all_skills,
        'location': location,
        'skill': skill,
        'search_query': search_query,
    })

def upload_bge_data(request):
    if request.method == 'POST':
        if 'excel_file' not in request.FILES:
            messages.error(request, 'Please select an Excel file to upload.')
            return redirect('upload_bge_data')
        excel_file = request.FILES['excel_file']
        if not excel_file.name.endswith(('.xlsx', '.xls')):
            messages.error(request, 'Please upload a valid Excel file (.xlsx or .xls)')
            return redirect('upload_bge_data')
        try:
            df = pd.read_excel(excel_file)
            success_count = 0
            error_count = 0
            for index, row in df.iterrows():
                try:
                    # Skip empty rows
                    if pd.isna(row.get('Full name', '')) or str(row.get('Full name', '')).strip() == '':
                        continue
                    
                    area1 = str(row.get('Skill area 1', '')).strip()
                    area2 = str(row.get('Skill area 2', '')).strip()
                    area3 = str(row.get('Skill area 3', '')).strip()
                    top_skills = ', '.join([a for a in [area1, area2, area3] if a])
                    bge_data = {
                        'name': str(row.get('Full name', '')).strip(),
                        'email': str(row.get('Email address', '')).strip(),
                        'phone': str(row.get('Phone number', '')).strip(),
                        'location': str(row.get('Location', '')).strip(),
                        'top_skills': top_skills,
                    }
                    BusinessGrowthExpert.objects.create(**bge_data)
                    success_count += 1
                except Exception as e:
                    error_count += 1
            messages.success(request, f'Successfully imported {success_count} BGEs. {error_count} errors occurred.')
        except Exception as e:
            messages.error(request, f'Error processing Excel file: {str(e)}')
        return redirect('bge_list')
    return render(request, 'portfolio/upload_bge.html')

def export_bge_excel(request):
    bges = BusinessGrowthExpert.objects.all()
    data = []
    for bge in bges:
        data.append({
            'Name': bge.name,
            'Email': bge.email,
            'Phone': bge.phone,
            'Top skills': bge.top_skills,
            'Location': bge.location,
            'Years of Experience': bge.years_of_experience,
            'MSMEs Supported': bge.msmes_supported,
        })
    df = pd.DataFrame(data)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='BGEs')
    output.seek(0)
    response = HttpResponse(output.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = 'attachment; filename=business_growth_experts.xlsx'
    return response

def bge_detail(request, bge_id):
    try:
        bge = BusinessGrowthExpert.objects.get(id=bge_id)
    except BusinessGrowthExpert.DoesNotExist:
        messages.error(request, 'Business Growth Expert not found.')
        return redirect('bge_list')
    return render(request, 'portfolio/bge_detail.html', {'bge': bge})

class BGEForm(forms.ModelForm):
    class Meta:
        model = BusinessGrowthExpert
        fields = '__all__'
        exclude = ['created_at', 'updated_at']

@login_required
def bge_edit(request, bge_id):
    try:
        bge = BusinessGrowthExpert.objects.get(id=bge_id)
    except BusinessGrowthExpert.DoesNotExist:
        messages.error(request, 'Business Growth Expert not found.')
        return redirect('bge_list')
    if request.method == 'POST':
        form = BGEForm(request.POST, instance=bge)
        if form.is_valid():
            form.save()
            messages.success(request, 'BGE updated successfully.')
            return redirect('bge_detail', bge_id=bge.id)
    else:
        form = BGEForm(instance=bge)
    return render(request, 'portfolio/bge_edit.html', {'form': form, 'bge': bge})

@login_required
def bge_delete(request, bge_id):
    if not request.user.is_staff and not request.user.is_superuser:
        messages.error(request, 'Only admins can delete BGEs.')
        return redirect('bge_detail', bge_id=bge_id)
    try:
        bge = BusinessGrowthExpert.objects.get(id=bge_id)
    except BusinessGrowthExpert.DoesNotExist:
        messages.error(request, 'Business Growth Expert not found.')
        return redirect('bge_list')
    if request.method == 'POST':
        bge.delete()
        messages.success(request, 'BGE deleted successfully.')
        return redirect('bge_list')
    return render(request, 'portfolio/bge_confirm_delete.html', {'bge': bge})

def export_msme_excel(request):
    msmes = MSME.objects.filter(is_active=True)
    data = []
    for msme in msmes:
        data.append({
            'MSME Code': msme.msme_code,
            'Business name': msme.business_name,
            'Location': f"{msme.city}, {msme.state}",
            'Owner name': msme.owner_name,
            'Sex of founder': msme.get_gender_display() if msme.gender else '',
            'Phone number': msme.phone,
            'Email address of founder': msme.email,
            'Business email': msme.business_email,
            'Age of founder': '',  # Not stored in current model
            'Industry': msme.get_sector_display(),
            'Scale of business': msme.get_business_type_display(),
            'Annual Revenue': msme.annual_revenue,
            'Employee Count': msme.employee_count,
            'Investment Needed': msme.investment_needed,
        })
    df = pd.DataFrame(data)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='MSMEs')
    output.seek(0)
    response = HttpResponse(output.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = 'attachment; filename=msmes.xlsx'
    return response

def support_request(request):
    matched_bges = None
    if request.method == 'POST':
        form = SupportRequestForm(request.POST)
        if form.is_valid():
            support_request = form.save(commit=False)
            msme = form.cleaned_data['msme']
            area_of_need = form.cleaned_data['area_of_need']
            support_request.msme_name = msme.business_name
            support_request.business_need = area_of_need
            support_request.latitude = form.cleaned_data.get('latitude')
            support_request.longitude = form.cleaned_data.get('longitude')
            support_request.save()
            # Matching logic: match BGE top_skills to area_of_need
            bges = BusinessGrowthExpert.objects.filter(status='approved')
            matched = []
            for bge in bges:
                skills = (bge.top_skills or '').lower()
                if area_of_need.lower() in skills:
                    matched.append(bge)
            support_request.matched_bges.set(matched)
            matched_bges = matched
            return render(request, 'portfolio/support_request_result.html', {'support_request': support_request, 'matched_bges': matched_bges})
    else:
        form = SupportRequestForm()
    return render(request, 'portfolio/support_request_form.html', {'form': form})

def bge_leaderboard(request):
    leaderboard = BusinessGrowthExpert.objects.filter(status='approved').annotate(
        demand_count=Count('support_requests', distinct=True)
    ).order_by('-demand_count', '-years_of_experience')[:10]
    return render(request, 'portfolio/bge_leaderboard.html', {'leaderboard': leaderboard})

def bge_signup(request):
    if request.method == 'POST':
        form = BGEPublicSignupForm(request.POST)
        if form.is_valid():
            bge = form.save(commit=False)
            bge.status = 'pending'
            bge.save()
            return render(request, 'portfolio/bge_signup_success.html', {'bge': bge})
    else:
        form = BGEPublicSignupForm()
    return render(request, 'portfolio/bge_signup.html', {'form': form})

@staff_member_required
def bge_approval_list(request):
    pending_bges = BusinessGrowthExpert.objects.filter(status='pending')
    return render(request, 'portfolio/bge_approval_list.html', {'pending_bges': pending_bges})

@staff_member_required
def bge_approve(request, bge_id):
    bge = BusinessGrowthExpert.objects.get(id=bge_id)
    bge.status = 'approved'
    bge.save()
    return redirect('bge_approval_list')

@staff_member_required
def bge_reject(request, bge_id):
    bge = BusinessGrowthExpert.objects.get(id=bge_id)
    bge.status = 'rejected'
    bge.save()
    return redirect('bge_approval_list')
