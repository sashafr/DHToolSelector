# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib import admin

# Register your models here.
from .models import MappingTools, Project, UserStories
admin.site.register(MappingTools)
admin.site.register(Project)
admin.site.register(UserStories)
