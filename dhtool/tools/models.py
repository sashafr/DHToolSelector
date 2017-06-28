#-*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

from mptt.models import MPTTModel, TreeForeignKey, TreeManyToManyField

# Create your models here.
class Inquiry(models.Model):
#	id = models.AutoField(primary_key=True)
	name = models.CharField(max_length=100, default="", blank=True, null=True)
        desc = models.CharField(max_length = 256, blank = True, null = True)
	def __str__(self):
		return self.name
	class Meta:
                verbose_name_plural = "inquiries"

class MappingTools(models.Model):
	software_name = models.CharField(max_length = 256, blank=True, null = True)
	software_link = models.URLField(max_length = 256, blank=True, null = True)
	data_input_format = models.CharField(max_length = 256, blank=True, null = True)
	data_output_format = models.CharField(max_length = 256, blank=True, null = True)
	is_penn_subscription = models.NullBooleanField()
	cost_penn = models.CharField(max_length = 256, blank=True, null = True)
	cost_non_penn = models.CharField(max_length = 256, blank=True, null = True)
	notes = models.CharField(max_length = 256, blank=True, null = True)
	image = models.ImageField(null=True, upload_to='media/image', height_field=None, width_field=None, max_length=100)
#	parent = TreeForeignKey('self', null=True, blank=True, related_name='children', db_index=True)
	def __str__(self):
		return self.software_name
	class Meta:
		verbose_name_plural = "mapping tools"

class Penn_guide_url(models.Model):
	link = models.URLField(max_length = 256, blank=True, null = True)
	mapping_tool = models.ForeignKey(MappingTools)
	def __str__(self):
		return self.link
	class Meta:
		verbose_name = "penn research guide"
		verbose_name_plural = "penn research guides"

class Other_guide_url(models.Model):
	link = models.URLField(max_length = 256, blank=True, null = True)
	mapping_tool = models.ForeignKey(MappingTools)
	def __str__(self):
		return self.link
	class Meta:
		verbose_name = "other research guide"
		verbose_name_plural = "other research guides"

class Page(models.Model):
	page_title = models.CharField(max_length=50)
	page_number = models.IntegerField(default=1)
	off_ramp_text = models.CharField(max_length=200)
	inquiry = models.ForeignKey(Inquiry)
	def __str__(self):
		return self.page_title

class UserStories(MPTTModel):
#	id = models.AutoField(primary_key=True)
#	title = models.CharField(max_length=50, unique=True)
	story_text = models.CharField(max_length=200)
	tool_tip = models.CharField(max_length=200, null=True, blank=True)
	inquiry = models.ForeignKey(Inquiry)
	page = models.ForeignKey(Page,default=1)
	recommendation = models.ForeignKey(MappingTools)
	recommendation = models.ManyToManyField(MappingTools, null=True, blank=True)
	parent = TreeForeignKey('self', null=True, blank=True, related_name='children', db_index=True)
	def __str__(self):
		return self.story_text
	class Meta:
		verbose_name_plural = "user stories"

#class Recommendations(MPTTModel):
#	user_story_id = models.ForeignKey(UserStories)
#	rec_id = models.ForeignKey(MappingTools)
#	user_story_id = TreeManyToManyField(MappingTools, null=True, blank=True)
