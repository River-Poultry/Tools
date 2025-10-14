"""
Vaccination notification templates for automated reminders
"""

VACCINATION_REMINDER_TEMPLATES = {
    'day_before': {
        'title': 'Vaccination Reminder - Tomorrow',
        'body': 'Your {vaccine_name} vaccination is scheduled for tomorrow ({scheduled_date}). Please ensure all preparations are ready.',
        'message_type': 'reminder',
        'icon_url': '/static/icons/vaccination-reminder.png',
        'action_url': '/vaccinations/{vaccination_id}',
    },
    'day_of': {
        'title': 'Vaccination Day - Today',
        'body': 'Today is vaccination day for {vaccine_name}. Time to vaccinate your {poultry_type} at {operation_name}.',
        'message_type': 'alert',
        'icon_url': '/static/icons/vaccination-today.png',
        'action_url': '/vaccinations/{vaccination_id}',
    },
    'day_after': {
        'title': 'Post-Vaccination Care Reminder',
        'body': 'Vaccination completed yesterday. Add vitamins to water for 3-5 days to minimize vaccine reactions and boost immunity.',
        'message_type': 'reminder',
        'icon_url': '/static/icons/vitamin-reminder.png',
        'action_url': '/vaccinations/{vaccination_id}/post-care',
    }
}

VITAMIN_CARE_TEMPLATES = {
    'vitamin_reminder': {
        'title': 'Vitamin Water Reminder',
        'body': 'Continue adding vitamins to drinking water for {days_remaining} more days to support post-vaccination recovery.',
        'message_type': 'reminder',
        'icon_url': '/static/icons/vitamin-water.png',
        'action_url': '/vaccinations/{vaccination_id}/vitamin-schedule',
    }
}

def get_vaccination_reminder_template(reminder_type, vaccination_plan):
    """
    Get formatted notification template for vaccination reminders
    
    Args:
        reminder_type (str): 'day_before', 'day_of', or 'day_after'
        vaccination_plan (VaccinationPlan): The vaccination plan instance
    
    Returns:
        dict: Formatted notification data
    """
    template = VACCINATION_REMINDER_TEMPLATES.get(reminder_type)
    if not template:
        return None
    
    # Get operation details
    operation = vaccination_plan.operation
    poultry_type = getattr(operation, 'poultry_type', 'poultry')
    
    # Format the template
    formatted_template = {
        'title': template['title'],
        'body': template['body'].format(
            vaccine_name=vaccination_plan.vaccine_name,
            scheduled_date=vaccination_plan.scheduled_date.strftime('%B %d, %Y'),
            poultry_type=poultry_type,
            operation_name=operation.operation_name,
            vaccination_id=vaccination_plan.id
        ),
        'message_type': template['message_type'],
        'icon_url': template['icon_url'],
        'action_url': template['action_url'].format(vaccination_id=vaccination_plan.id),
        'extra_data': {
            'vaccination_id': vaccination_plan.id,
            'vaccine_name': vaccination_plan.vaccine_name,
            'scheduled_date': vaccination_plan.scheduled_date.isoformat(),
            'operation_id': operation.id,
            'reminder_type': reminder_type,
            'route': vaccination_plan.route,
            'dosage': vaccination_plan.dosage,
        }
    }
    
    return formatted_template

def get_vitamin_care_template(vaccination_plan, days_remaining):
    """
    Get formatted notification template for vitamin care reminders
    
    Args:
        vaccination_plan (VaccinationPlan): The vaccination plan instance
        days_remaining (int): Days remaining for vitamin care
    
    Returns:
        dict: Formatted notification data
    """
    template = VITAMIN_CARE_TEMPLATES['vitamin_reminder']
    
    formatted_template = {
        'title': template['title'],
        'body': template['body'].format(
            days_remaining=days_remaining,
            vaccination_id=vaccination_plan.id
        ),
        'message_type': template['message_type'],
        'icon_url': template['icon_url'],
        'action_url': template['action_url'].format(vaccination_id=vaccination_plan.id),
        'extra_data': {
            'vaccination_id': vaccination_plan.id,
            'vaccine_name': vaccination_plan.vaccine_name,
            'days_remaining': days_remaining,
            'reminder_type': 'vitamin_care',
        }
    }
    
    return formatted_template
