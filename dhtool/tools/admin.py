# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib import admin

# Register your models here.
from .models import Inquiry, Page, MappingTools, UserStories, PennGuideURL, OtherGuideURL

class PennGuideURLInline(admin.StackedInline):
    model = PennGuideURL
    extra = 0

class OtherGuideURLInline(admin.StackedInline):
    model = OtherGuideURL
    extra = 0

class MappingToolsAdmin(admin.ModelAdmin):
    fieldsets = [
        (None, {'fields': ['software_name']}),
        (None, {'fields': ['software_link']}),
        (None, {'fields': ['data_input_format']}),
        (None, {'fields': ['data_output_format']}),
        (None, {'fields': ['is_penn_subscription']}),
        (None, {'fields': ['cost_penn']}),
        (None, {'fields': ['cost_non_penn']}),
        (None, {'fields': ['image']}),
        ('Notes', {'fields': ['notes'], 'classes': ['collapse']}),
    ]
    inlines = [PennGuideURLInline, OtherGuideURLInline]

class InquiryAdmin(admin.ModelAdmin):
    fieldsets = [
        (None, {'fields': ['name']}),
        (None, {'fields': ['desc']}),
    ]

admin.site.register(MappingTools, MappingToolsAdmin)
admin.site.register(Inquiry, InquiryAdmin)
admin.site.register(UserStories)
admin.site.register(Page)
