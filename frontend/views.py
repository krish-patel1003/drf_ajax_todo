from django.shortcuts import render

# Create your views here.

def list(request):
    return render(request, template_name='frontend/list.html')