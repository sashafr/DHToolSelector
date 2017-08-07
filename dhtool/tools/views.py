# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render, get_object_or_404
from django.shortcuts import render

from django.http import HttpResponse

from .models import Tools, Page
from .models import UserStories
from django.template import loader
from .models import Inquiry

def inquiry(request):
	template = loader.get_template('tools/inquiry.html')
	context = {
		'inquiry_all' : Inquiry.objects.all(),
	}
	return HttpResponse(template.render(context, request))

def detail(request, id):
	select_tool = get_object_or_404(Tools, pk = id)
	template = loader.get_template('tools/detail.html')

	context = {
		'select_tool' : select_tool,
	}
	return HttpResponse(template.render(context, request))

def result(request):
	story_ids = request.GET.getlist('story')
	rec_result = Tools.objects.order_by('id')

	for story_id in story_ids:
		rec_result = rec_result.filter(userstories=story_id)

	template = loader.get_template('tools/result.html')
	context = {
		'rec_result' : rec_result,
	}
	return HttpResponse(template.render(context, request))

def page(request, id):
	select_inquiry = get_object_or_404(Inquiry, pk = id)
	all_pages = select_inquiry.page_set.order_by('page_number')
	page_dict = {}
	for page in all_pages:
		story_list = page.userstories_set.all()
		page_dict[page] = story_list

	template = loader.get_template('tools/page.html')
	context = {
		'page_dict' : page_dict,
	}
	return HttpResponse(template.render(context, request))
