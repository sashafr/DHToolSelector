# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.test import TestCase

from .models import Inquiry, MappingTools, UserStories, Page

from django.urls import reverse

def create_inquiry(inquiry_name):
    return Inquiry.objects.create(name=inquiry_name)

def create_page(title, number, text, related_inquiry):
    return Page.objects.create(page_title=title, page_number=number, off_ramp_text=text, 
        inquiry=related_inquiry)

def create_mapping_tool(name, penn_subscription):
    return MappingTools.objects.create(software_name=name, is_penn_subscription=penn_subscription)

def create_user_story(text, related_inquiry, related_page, node):
    return UserStories.objects.create(story_text=text, inquiry=related_inquiry, page=related_page, 
        parent=node)

class UserStoriesMPTTModelTestCase(TestCase):
    def test_mptt_model(self):
        new_inquiry = create_inquiry('Digital Humanity Tool Selector')
        new_page = create_page('default page', 1, 'no information', new_inquiry)
        # create the root of the tree
        root = create_user_story('Root', new_inquiry, new_page, None)
        # create two children of the root
        childA = create_user_story('Child A', new_inquiry, new_page, root)
        childB = create_user_story('Child B', new_inquiry, new_page, root)
        self.assertEqual(root.level, 0)
        self.assertEqual(childA.level, 1)
        self.assertEqual(childB.level, 1)
        self.assertQuerysetEqual(root.get_descendants(),
                                ['<UserStories: Child A>', '<UserStories: Child B>'])
        #create a grandchild
        grandchild = create_user_story('Grandchild', new_inquiry, new_page, childA)
        self.assertEqual(grandchild.level, 2)
        #the tree_id of the grandchild should be the same as the tree_id of the root
        self.assertEqual(grandchild.tree_id, root.tree_id)
        #create another root
        anotherRoot = create_user_story('Another root', new_inquiry, new_page, None)
        self.assertNotEqual(root.tree_id, anotherRoot.tree_id)

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
        self.assertQuerysetEqual(response.context['inquiry_all'], 
            ['<Inquiry: Digital Humanity Tool Selector>'])
        #the link to page.html should be include in the response
        inquiry_url = '<a href="%s">%s</a>' % (reverse('page', args=(new_inquiry.id,)), 
            new_inquiry.name)
        self.assertContains(response, inquiry_url, html=True)

class PageViewTestCase(TestCase):
    def setUp(self):
        self.new_inquiry = create_inquiry('Digital Humanity Tool Selector')

    def tearDown(self):
        del self.new_inquiry

    def test_no_page(self):
        url = reverse('page', args=(self.new_inquiry.id,))
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "No pages are available.")
        #no form should appear because there is no page
        submit_url = '<form class="page-form" action="%s">' % reverse('result')
        self.assertNotContains(response, submit_url)

        #test invalid inquiry.id for page.html
        url = reverse('page', args=(self.new_inquiry.id+1,))
        response = self.client.get(url)
        self.assertEqual(response.status_code, 404)

    def test_one_page(self):
        create_page('default page', 1, 'no information', self.new_inquiry)
        url = reverse('page', args=(self.new_inquiry.id,))
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertQuerysetEqual(response.context['page_dict'], {'<Page: default page>':'<>'})

        #form should appear because there is a page
        submit_url = '<form class="page-form" action="%s">' % reverse('result')
        self.assertContains(response, submit_url)

    def test_three_pages(self):
        create_page('page1', 1, 'no information', self.new_inquiry)
        create_page('page2', 2, 'no information', self.new_inquiry)
        create_page('page3', 3, 'no information', self.new_inquiry)
        url = reverse('page', args=(self.new_inquiry.id,))
        response = self.client.get(url)
        self.assertEqual(len(response.context['page_dict']), 3)

        #page_titles should be included in the response
        self.assertContains(response, "page1")
        self.assertContains(response, "page2")
        self.assertContains(response, "page3")

        #the warning message should appear because none of the pages has user stories.
        self.assertContains(response, "No user stories are available")

    def test_page_with_user_story(self):
        new_page = create_page('default page', 1, 'no information', self.new_inquiry)
        storyA = create_user_story('Story A', self.new_inquiry, new_page, None)
        url = reverse('page', args=(self.new_inquiry.id,))
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Story A")
        checkbox = '<input type="checkbox" name="story" value="%d" autocomplete="off">' % storyA.id
        self.assertContains(response, checkbox)

class ResultViewTestCase(TestCase):
    def setUp(self):
        self.new_inquiry = create_inquiry('Digital Humanity Tool Selector')
        self.new_page = create_page('default page', 1, 'no information', self.new_inquiry)
        self.story = create_user_story('Story A', self.new_inquiry, self.new_page, None)

    def tearDown(self):
        del self.new_inquiry
        del self.new_page
        del self.story

    def test_no_user_story(self):
        url = reverse('result')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "No tools are available.")

    def test_no_available_tool(self):
        url = "%s?story=%d" % (reverse('result'), self.story.id)
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertQuerysetEqual(response.context['rec_result'], [])
        self.assertContains(response, "No tools are available.")

    def test_result_for_one_tool(self):
        mapping_tool = create_mapping_tool('Tool', True)
        self.story.recommendation.add(mapping_tool)
        url = "%s?story=%d" % (reverse('result'), self.story.id)
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertQuerysetEqual(response.context['rec_result'], ['<MappingTools: Tool>'])
        self.assertContains(response, mapping_tool.software_name)

        #the link for tool details should be included in the response
        detail_url = '<a href="%s">see more detail</a>' % reverse('detail', args=(mapping_tool.id,))
        self.assertContains(response, detail_url)

    def test_filter_tools_by_stories(self):
        toolA = create_mapping_tool('ToolA', True)
        toolB = create_mapping_tool('ToolB', True)
        self.story.recommendation.add(toolA)
        self.story.recommendation.add(toolB)

        toolC = create_mapping_tool('ToolC', True)
        anotherStory = create_user_story('Story B', self.new_inquiry, self.new_page, None)
        anotherStory.recommendation.add(toolB)
        anotherStory.recommendation.add(toolC)

        url = "%s?story=%d&story=%d" % (reverse('result'), self.story.id, anotherStory.id)
        response = self.client.get(url)
        self.assertQuerysetEqual(response.context['rec_result'], ['<MappingTools: ToolB>'])
        self.assertContains(response, toolB.software_name)
        self.assertNotContains(response, toolA.software_name)
        self.assertNotContains(response, toolC.software_name)

class DetailViewTestCase(TestCase):
    def test_invalid_tool_id(self):
        response = self.client.get(reverse('detail', args=(1,)))
        self.assertEqual(response.status_code, 404)
    def test_valid_tool_id(self):
        mapping_tool = create_mapping_tool('Tool', True)
        response = self.client.get(reverse('detail', args=(mapping_tool.id,)))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, mapping_tool.software_name)
