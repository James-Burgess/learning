from django.db import models

# Create your models here.
class post(models.Model):
    title = models.CharField(max_length=140)
    body = models.TextField()
    date = models.DateTimeField()

    def __string__(self):
        return self.title
