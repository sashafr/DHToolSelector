# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.test import TestCase

from .models import Inquiry, MappingTools, UserStories, Page

from django.urls import reverse

def create_inquiry(inquiry_name):
    return Inquiry.objects.create(name=inquiry_name)

def create_page(title, number, text, related_inquiry):
    return Page.objects.create(page_title=title, page_number=number, off_ramp_text=text, inquiry=related_inquiry)

class DHToolSelectorTestCase(TestCase):
    def test_DHTool(self):
        response = self.client.get('/tools/')
        self.assertEqual(response.status_code, 200)

    def test_admin(self):
        response = self.client.get('/admin/')
        self.assertEqual(response.status_code, 302)

    def test_invalid_url(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 404)

class InquiryViewTestCase(TestCase):
    def test_add_inquiry(self):
        self.assertEqual(Inquiry.objects.count(), 0)
        create_inquiry('Digital Humanity Tool Selector')
        self.assertEqual(Inquiry.objects.count(), 1)

    def test_no_inquiry(self):
        response = self.client.get(reverse('inquiry'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "No inquiries are available.")
        self.assertQuerysetEqual(response.context['inquiry_all'], [])

    def test_one_inquiry(self):
        new_inquiry = create_inquiry('Digital Humanity Tool Selector')
        response = self.client.get(reverse('inquiry'))
        self.assertEqual(response.status_code, 200)
        self.assertQuerysetEqual(response.context['inquiry_all'], ['<Inquiry: Digital Humanity Tool Selector>'])

class PageViewTestCase(TestCase):
    def setUp(self):
        self.new_inquiry = create_inquiry('Digital Humanity Tool Selector')

    def tearDown(self):
        del self.new_inquiry

    def test_no_pages(self):
        url = reverse('page', args=(self.new_inquiry.id,))
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "No pages are available.")

    def test_one_page(self):
        create_page('default page', 1, 'no information', self.new_inquiry)
        url = reverse('page', args=(self.new_inquiry.id,))
        response = self.client.get(url)
        self.assertQuerysetEqual(response.context['page_dict'], {'<Page: default page>':'<>'})
