from django.shortcuts import render
from django.http import HttpResponse


def index(requesst):
    return HttpResponse("<h1>awe</h1>")

# Create your views here.
