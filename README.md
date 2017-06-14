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
* Add 'mptt' and 'jquery' in INSTALLED_APPS in settings.py:

    ```python
    INSTALLED_APPS = [
      ...
      'mptt',
      'jquery',
    ]

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

  `$ python manage.py runserver`

  The default port is 8000. Visit `http://localhost:8000/admin` to add data and `http://localhost:8000/tools` to see the views.

## Setting up a deployment server
