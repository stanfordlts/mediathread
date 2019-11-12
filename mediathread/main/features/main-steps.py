from aloe_django import django_url
from aloe import world, step
from selenium.webdriver.support.select import Select
from selenium.common.exceptions import NoSuchElementException


@step(u'video upload is enabled')
def video_upload_is_enabled(step):
    if world.using_selenium:
        world.browser.get(django_url("/dashboard/sources/"))
        try:
            elt = world.browser.find_element_by_id("mediathread-video-upload")
            if elt:
                elt.click()
                world.browser.get(django_url("/"))
        except NoSuchElementException:
            pass  # It's already enabled. That's ok.


@step(u'I see ([0-9][0-9]?) sources?')
def i_see_count_source(step, count):
    if world.using_selenium:
        elts = world.browser.find_elements_by_css_selector(
            "div.recommend_source")
        assert len(elts) == int(count), \
            "Expected %s. Actually found %s" % (count, len(elts))


@step(u'I add YouTube to the class')
def when_i_add_youtube_to_the_class(step):
    if world.using_selenium:
        elt = world.browser.find_element_by_id("youtube")
        elt.click()


@step(u'I allow ([^"]*)s to upload videos')
def i_allow_level_to_upload_videos(step, level):
    elt = world.browser.find_element_by_name('upload_permission')
    assert elt is not None, "Select element not found %s" % 'upload_permission'

    select = Select(elt)
    select.select_by_visible_text(level)

    form = world.browser.find_element_by_name("form-upload-permission")
    form.submit()


@step(u'The selection visibility is "([^"]*)"')
def the_selection_visibility_is_value(step, value):
    elt = world.browser.find_element_by_id('id_see_eachothers_selections')

    if value == 'Yes':
        assert (elt.get_attribute('checked') == 'true'), \
            "The checked attribute was %s" % elt.get_attribute("checked")
    else:
        assert (elt.get_attribute('checked') is None), \
            "The checked attribute was %s" % elt.get_attribute("checked")


@step(u'I can upload on behalf of other users')
def i_can_upload_on_behalf_of_other_users(step):
    world.browser.find_element_by_id('video_owners')


@step(u'I cannot upload on behalf of other users')
def i_cannot_upload_on_behalf_of_other_users(step):
    try:
        world.browser.find_element_by_id('video_owners')
        assert False, "This user can upload on behalf of other users"
    except NoSuchElementException:
        pass  # expected


@step(u'There is not an "Upload From Computer" feature')
def there_is_not_an_upload_from_computer_feature(step):
    try:
        world.browser.find_element_by_id('upload-from-computer')
        assert False, "Found an Upload From Computer menu link"
    except NoSuchElementException:
        pass  # expected


@step(u'There is an "Upload From Computer" feature')
def there_is_an_upload_from_computer_feature(step):
    try:
        world.browser.find_element_by_id('upload-from-computer')
    except NoSuchElementException:
        assert False, "Cannot find the Upload From Computer link"


@step('I open the "Upload From Computer" feature')
def i_open_the_upload_from_computer_feature(step):
    try:
        elt = world.browser.find_element_by_id('upload-from-computer')
        h3 = elt.find_element_by_tag_name('h3')
        h3.click()
    except NoSuchElementException:
        assert False, "Cannot find the Upload From Computer link"
        return
