from django.db import models

# Create your models here.
class profile(models.Model):
    """
    Description: Hierarchy of user profiles
    """
    name = models.CharField(max_length=120)
    description = models.TextField(default='Description default text')
    location = models.CharField(max_length=120, default='unknown location', blank=True, null=True)
    Job = models.CharField(max_length=120, null=True)

    def __unicode__(self):
    	return self.name
