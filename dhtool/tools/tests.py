# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.test import TestCase

from .models import Inquiry, MappingTools, UserStories, Page

# Create your tests here.
class DHToolSelectorTestCase(TestCase):
    def test_DHTool(self):
        resp = self.client.get('/tools/')
        self.assertEqual(resp.status_code, 200)

    def test_admin(self):
        resp = self.client.get('/admin/')
        self.assertEqual(resp.status_code, 302)
