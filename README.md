# DHtoolsSelector
DHtoolsSelector for Penn Libraries
## Description

## Prerequisites
* Python 2.7 or Python 3
* Pip
* Database

   Install the database you plan to use and the appropriate database bindings. For example, to use MySQL run:

   ```
   $ sudo apt-get mysql-server
   $ sudo apt-get install libmysqlclient-dev python-dev
   $ pip install mysqlclient>=1.3.3
   ```

## Getting started
### Clone this repo:

    ```
    $ git clone https://github.com/upenndigitalscholarship/DHtoolsSelector.git`
    $ cd DHtoolsSelector
    ```

### Install the requirements:

  `$ pip install -r requirements.txt`

### Create a settings file: `/path/to/dhtool/dhtool/settings.py` and add the credentials.
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

  MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
  MEDIA_URL = '/media/'
  ```

  You can refer to the Django tutorial for more information about adding credentials in settings.py:

     https://docs.djangoproject.com/en/1.11/intro/tutorial01

### Run migrations and create a superuser account:

  After you've add the configurations in settings file, you'll need to run Django's migrations and create a superuser account. You can use these commands:

  ```
  $ python manage.py migrate
  $ python manage.py createsuperuser
  ```
### Run the development server:

  You can run the development server with the command:

  `$ python manage.py runserver [server IP][port number]`

  Visit `http://[server IP]:[port number]/admin/` to use the admin interface, and `http://[server IP]:[port number]/tools/` to see the views.

## Setting up a deployment server
   To get the application into production, you can serve the project with Apache and mod_wsgi with the following steps.

* Install Apache2 & mod_wsgi:

  ```
  $ sudo apt-get update
  $ sudo apt-get install python-pip apache2 libapache2-mod-wsgi
  ```

* Collect static files:

  `$ python manage.py collectstatic`

* Grant write permissions to Apache user group:

  The default Apache user group is www-data, and you'll need to grant write permissions to the www-data group so that your project users can upload image files in admin interface. You can run these commands:

  ```
  $ cd /path/to/dhtool/
  $ chgrp -R www-data /path/to/dhtool/media/
  $ chmod -R g+w /path/to/dhtool/media/
  ```

* Edit Apache server's httpd.conf file to configure the WSGI pass:

  If you're using Ubuntu 16.04, open the default virtual host file:

  `$ sudo nano /etc/apache2/sites-available/000-default.conf`

  Edit the file like this:

  ```
   <VirtualHost *:80>
   . . .
   WSGIDaemonProcess dhtool.com python-path=/path/to/dhtool/dhtool/wsgi.py
   WSGIProcessGroup dhtool.com

   Alias /robots.txt /path/to/dhtool/static/robots.txt
   Alias /favicon.ico /path/to/dhtool/static/favicon.ico
   Alias /media/ /path/to/dhtool/media/
   Alias /static/ /path/to/dhtool/static/

   <Directory /path/to/dhtool/static>
   Require all granted
   </Directory>

   <Directory /path/to/dhtool/media>
   Require all granted
   </Directory>

   <Directory /path/to/dhtool/dhtool>
   <Files wsgi.py>
   Require all granted
   </Files>
   </Directory>
   ...
   </VirtualHost>
   ```

* Check your Apache files to make sure you did not make any syntax errors:

  `$ sudo apache2ctl configtest`

  As long as the last line of output looks like this "Syntax OK", your files are in good shape.

* Restart the Apache service to implement changes:

  `$ sudo systemctl restart apache2`

You can refer to the following links for more information about how to set up a deployment server:

  https://docs.djangoproject.com/en/1.11/howto/deployment/wsgi/modwsgi

  https://www.digitalocean.com/community/tutorials/how-to-serve-django-applications-with-apache-and-mod_wsgi-on-ubuntu-16-04
