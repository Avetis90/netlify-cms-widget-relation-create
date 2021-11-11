import './bootstrap.js';
import CMS, { init } from 'netlify-cms-app';
import 'netlify-cms/dist/cms.css';
import RelationCreate from '../src';

const config = {
  backend: {
    name: 'test-repo',
    login: false,
  },
  media_folder: 'assets',
  collections: [
    {
      name: 'test',
      label: 'Test',
      folder: 'posts',
      create: true,
      fields: [
        { label: 'Title', name: 'title', widget: 'string' },
        {
          label: 'Tags',
          name: 'postTags',
          widget: 'relation-create',
          collection: 'tags',
          value_field: 'title',
          search_fields: ['title'],
          multiple: true,
        },
      ],
    },
    {
      name: 'tags',
      label: 'Tags',
      folder: 'tags',
      create: true,
      fields: [{ label: 'Title', name: 'title', widget: 'string' }],
    },
  ],
};

CMS.registerWidget(
  'relation-create',
  RelationCreate.RelationCreateControl,
  RelationCreate.RelationCreatePreview
);

init({ config });
