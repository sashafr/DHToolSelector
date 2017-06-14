# DHtoolsSelector
DHtoolsSelector for Penn Libraries
## Description

## Prerequisites
* Python 2.7 or Python 3
* Pip
* Database

   Install the database you plan to use and the appropriate database bindings. For example, to use MySQL run:

   `$ sudo apt-get mysql-server`

   `$ sudo apt-get install libmysqlclient-dev python-dev`

   `$ pip install mysqlclient>=1.3.3`

## Getting started
### To install the project, first run:

  `git clone [this repo url]`

### Install the requirements:

  `pip install -r requirements.txt`

### Create a settings file here: `dhtool/dhtool/settings.py` and add credentials.
* Configure the allowed host:

   ```python
   ALLOWED_HOSTS = ['server_domain_or_IP']
   ```

* Add 'mptt' and 'jquery' in INSTALLED_APPS in settings.py:

    ```python
    INSTALLED_APPS = [
      ...
      'mptt',
      'jquery',
    ]
    ```
* Set up database engine in settings.py. For example, if you're using MySQL,
  you can add the configurations like this:

  ```python
  DATABASES = {
    'default': {
      'ENGINE': 'django.db.backends.mysql',
        'NAME': 'db_name',
        'USER': 'name',
        'PASSWORD': '',
        'HOST': 'localhost',
        'PORT': '',
        }
        }
        ```
* Add configurations for static files and media files:

  ```python
  STATIC_URL = '/static/'
  STATIC_ROOT = os.path.join(BASE_DIR, 'static/')

  MEDIA_ROOT = os.path.join(BASE_DIR,'static','media')
  MEDIA_URL = '/media/'
  ```

  You can refer to the Django tutorial for more information about adding credentials in settings.py:

     https://docs.djangoproject.com/en/1.11/intro/tutorial01

### Run default migrations and create a superuser account:

  After you've add the configurations in settings file, you'll need to run Django's default migrations and create a superuser account. You can use these commands:

  `$ python manage.py migrate`

  `$ python manage.py createsuperuser`

### Run the development server:

  You can run the development server with the command:

  `$ python manage.py runserver [server IP][port number]`

  Visit `http://[server IP]:[port number]/admin/` to use admin interface, and `http://[server IP]:[port number]/tools/` to see the views.

  If you don't add server's IP, the default addresses are `http://localhost:8000/tools/` and `http://localhost:8000/admin/`.

## Setting up a deployment server
   To get the application into production, you can serve it with Apache and mod_wsgi.

* Install Apache2 & modWSGI:
  First you'll need to install Apache2 and mod_wsgi:

   `$ sudo apt-get update
    $ sudo apt-get install python-pip apache2 libapache2-mod-wsgi`

* Grant write permissions to Apache user
  The default Apache user group is www-data, and you'll need to grant write permissions to the www-data group so that your project users can upload image files in admin interface. You can run these commands:

    `$ cd .../dhtool/media/
     $ chgrp -R www-data .../dhtool/media/media
     $ chmod -R g+w .../dhtool/media/media`

* Edit Apache server's httpd.conf file
  Once you've got Apache and mod_wsgi installed and activated, edit Apache server's httpd.conf file to configure the WSGI pass. If you're using Ubuntu 16.04, open the default virtual host file:

  `sudo nano /etc/apache2/sites-available/000-default.conf`

  Edit the file like this:

   `<VirtualHost *:80>
   . . .
   WSGIDaemonProcess dhtool.com python-path=.../dhtool/dhtool/wsgi.py
   WSGIProcessGroup dhtool.com

   <Directory .../dhtool/dhtool>
   <Files wsgi.py>
   Require all granted
   </Files>
   </Directory>

   Alias /robots.txt .../dhtool/static/robots.txt
   Alias /favicon.ico .../dhtool/static/favicon.ico
   Alias /media/ .../dhtool/media/
   Alias /static/ .../dhtool/static/

   <Directory /home/jinyun/jinyun/DHtoolsSelector/dhtool/static>
   Require all granted
   </Directory>

   </VirtualHost>`

* check your Apache files to make sure you did not make any syntax errors:

  `$ sudo apache2ctl configtest`

  As long as the last line of output looks like this "Syntax OK", your files are in good shape.

* restart the Apache service to implement changes:
  `$ sudo systemctl restart apache2`

  Refer to the following links for more information about how to set up a deployment server:

  https://docs.djangoproject.com/en/1.11/howto/deployment/wsgi/modwsgi
  
  https://www.digitalocean.com/community/tutorials/how-to-serve-django-applications-with-apache-and-mod_wsgi-on-ubuntu-16-04
