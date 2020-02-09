from django.urls import path
from django.conf.urls import url, include
from django.views.generic import ListView, DetailView

from blog.models import post


appname="blog"
urlpatterns = [
    url(r'^$', ListView.as_view(queryset=post.objects.order_by("-date")[:25],
        template_name='blog/blog.html')),
    path('/<pk>/', DetailView.as_view(model=post, template_name='blog/post.html') )
]
