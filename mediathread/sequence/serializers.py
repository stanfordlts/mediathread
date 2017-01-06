from rest_framework import serializers

from mediathread.djangosherd.models import SherdNote
from mediathread.djangosherd.serializers import SherdNoteSerializer
from mediathread.projects.models import Project, ProjectSequenceAsset
from mediathread.sequence.models import (
    SequenceAsset, SequenceMediaElement, SequenceTextElement,
)
from mediathread.sequence.validators import (
    prevent_overlap, valid_start_end_times
)


class SequenceMediaElementSerializer(serializers.ModelSerializer):
    class Meta:
        model = SequenceMediaElement
        fields = ('media', 'media_asset', 'start_time', 'end_time')

    media = serializers.PrimaryKeyRelatedField(
        queryset=SherdNote.objects.all())
    media_asset = SherdNoteSerializer(read_only=True)

    def to_internal_value(self, data):
        data['start_time'] = round(data['start_time'], 5)
        data['end_time'] = round(data['end_time'], 5)
        return super(SequenceMediaElementSerializer, self).to_internal_value(
            data)


class SequenceTextElementSerializer(serializers.ModelSerializer):
    class Meta:
        model = SequenceTextElement
        fields = ('text', 'start_time', 'end_time')

    def to_internal_value(self, data):
        data['start_time'] = round(data['start_time'], 5)
        data['end_time'] = round(data['end_time'], 5)
        return super(SequenceTextElementSerializer, self).to_internal_value(
            data)


class CurrentProjectDefault(object):
    """This is based on djangorestframework's CurrentUserDefault."""
    def set_context(self, serializer_field):
        pid = serializer_field.context['request'].data.get('project')
        if pid:
            pid = int(pid)
        self.project = pid

    def __call__(self):
        return self.project


class SequenceAssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = SequenceAsset
        fields = ('id', 'spine', 'spine_asset', 'author', 'course',
                  'project', 'media_elements', 'text_elements',)

    author = serializers.PrimaryKeyRelatedField(
        read_only=True, default=serializers.CurrentUserDefault())
    project = serializers.HiddenField(default=CurrentProjectDefault())
    spine = SherdNoteSerializer(read_only=True)
    spine_asset = serializers.ReadOnlyField(source='spine.asset.id')
    media_elements = SequenceMediaElementSerializer(many=True)
    text_elements = SequenceTextElementSerializer(many=True)

    def validate(self, data):
        text_elements = data.get('text_elements')
        media_elements = data.get('media_elements')

        if not data.get('spine') and (
                len(text_elements) > 0 or len(media_elements) > 0):
            raise serializers.ValidationError(
                'A SequenceAsset with track elements and no spine is invalid.')

        valid_start_end_times(text_elements + media_elements)

        prevent_overlap(text_elements)
        prevent_overlap(media_elements)

        return data

    def create(self, validated_data):
        project = Project.objects.get(pk=validated_data.get('project'))
        if ProjectSequenceAsset.objects.filter(
                sequence_asset__author=validated_data.get('author'),
                project=project).exists():
            raise serializers.ValidationError(
                'A SequenceAsset already exists for this project '
                'and user.')

        instance = SequenceAsset.objects.create(
            author=validated_data.get('author'),
            course=validated_data.get('course'),
            spine=validated_data.get('spine'))
        instance.full_clean()

        instance.update_track_elements(
            validated_data.get('media_elements'),
            validated_data.get('text_elements'))

        ProjectSequenceAsset.objects.get_or_create(
            sequence_asset=instance, project=project)

        return instance

    def update(self, instance, validated_data):
        instance.spine = validated_data.get('spine')
        instance.save()

        instance.update_track_elements(
            validated_data.get('media_elements'),
            validated_data.get('text_elements'))

        return instance
