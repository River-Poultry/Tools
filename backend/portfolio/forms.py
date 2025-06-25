from django import forms
from .models import SupportRequest, MSME, BusinessGrowthExpert

class SupportRequestForm(forms.ModelForm):
    msme = forms.ModelChoiceField(queryset=MSME.objects.filter(is_active=True), label="Select Your MSME", required=True)
    area_of_need = forms.ChoiceField(choices=[], label="Area of Need", required=True)
    latitude = forms.DecimalField(max_digits=9, decimal_places=6, required=False, label="Latitude")
    longitude = forms.DecimalField(max_digits=9, decimal_places=6, required=False, label="Longitude")

    class Meta:
        model = SupportRequest
        fields = ['msme', 'area_of_need', 'contact_email', 'contact_phone', 'location', 'latitude', 'longitude']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Combine BGE skills and MSME sectors for area_of_need choices
        bge_skills = []
        for bge in BusinessGrowthExpert.objects.all():
            if bge.top_skills:
                bge_skills.extend([skill.strip() for skill in bge.top_skills.split(',')])
            if bge.second_area:
                bge_skills.append(bge.second_area.strip())
            if bge.third_area:
                bge_skills.append(bge.third_area.strip())
        
        msme_sectors = [s[1] for s in MSME.SECTORS]
        all_areas = sorted(set(bge_skills + msme_sectors))
        self.fields['area_of_need'].choices = [(a, a) for a in all_areas]

class BGEPublicSignupForm(forms.ModelForm):
    latitude = forms.DecimalField(max_digits=9, decimal_places=6, required=False, label="Latitude")
    longitude = forms.DecimalField(max_digits=9, decimal_places=6, required=False, label="Longitude")
    class Meta:
        model = BusinessGrowthExpert
        fields = [
            'name', 'email', 'phone', 'location',
            'years_of_experience', 'top_skills', 'second_area', 'third_area', 'latitude', 'longitude'
        ]
        widgets = {
            'top_skills': forms.TextInput(attrs={'placeholder': 'e.g. Marketing, Finance'}),
            'second_area': forms.TextInput(attrs={'placeholder': 'e.g. Livestock'}),
            'third_area': forms.TextInput(attrs={'placeholder': 'e.g. Agronomy'}),
        } 