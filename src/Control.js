import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Creatable from 'react-select/async-creatable';
import { debounce, find, get, isEmpty, last, uniqBy } from 'lodash';
import { fromJS, List, Map } from 'immutable';
import { reactSelectStyles } from 'netlify-cms-ui-default';
import { stringTemplate, validations } from 'netlify-cms-lib-widgets';
function arrayMove(array, from, to) {
  const slicedArray = array.slice();
  slicedArray.splice(
    to < 0 ? array.length + to : to,
    0,
    slicedArray.splice(from, 1)[0]
  );
  return slicedArray;
}

function optionToString(option) {
  return option && option.value ? option.value : '';
}

function convertToOption(raw) {
  if (typeof raw === 'string') {
    return { label: raw, value: raw };
  }
  return Map.isMap(raw) ? raw.toJS() : raw;
}

function getSelectedOptions(value) {
  const selectedOptions = List.isList(value) ? value.toJS() : value;

  if (!selectedOptions || !Array.isArray(selectedOptions)) {
    return null;
  }

  return selectedOptions;
}

function uniqOptions(initial, current) {
  return uniqBy(initial.concat(current), o => o.value);
}

function getSearchFieldArray(searchFields) {
  return List.isList(searchFields) ? searchFields.toJS() : [searchFields];
}

function getSelectedValue({ value, options, isMultiple }) {
  if (isMultiple) {
    const selectedOptions = getSelectedOptions(value);
    if (selectedOptions === null) {
      return null;
    }

    const selected = selectedOptions
      .map(i => options.find(o => o.value === (i.value || i)))
      .filter(Boolean)
      .map(convertToOption);
    return selected;
  } else {
    return find(options, ['value', value]) || null;
  }
}

export default class RelationCreateControl extends React.Component {
  mounted = false;

  state = {
    initialOptions: [],
  };

  static propTypes = {
    onChange: PropTypes.func.isRequired,
    forID: PropTypes.string.isRequired,
    value: PropTypes.node,
    field: ImmutablePropTypes.map,
    query: PropTypes.func.isRequired,
    queryHits: PropTypes.array,
    classNameWrapper: PropTypes.string.isRequired,
    setActiveStyle: PropTypes.func.isRequired,
    setInactiveStyle: PropTypes.func.isRequired,
  };

  isValid = () => {
    console.log(1);
    const { field, value, t } = this.props;
    const min = field.get('min');
    const max = field.get('max');

    if (!this.isMultiple()) {
      return { error: false };
    }

    const error = validations.validateMinMax(
      t,
      field.get('label', field.get('name')),
      value,
      min,
      max
    );

    return error ? { error } : { error: false };
  };

  shouldComponentUpdate(nextProps) {
    console.log('shouldComponentUpdate');
    return (
      this.props.value !== nextProps.value ||
      this.props.hasActiveStyle !== nextProps.hasActiveStyle ||
      this.props.queryHits !== nextProps.queryHits
    );
  }

  async componentDidMount() {
    console.log('componentDidMount');
    this.mounted = true;
    // if the field has a previous value perform an initial search based on the value field
    // this is required since each search is limited by optionsLength so the selected value
    // might not show up on the search
    const { forID, field, value, query, onChange } = this.props;
    const collection = field.get('collection');
    const file = field.get('file');
    const initialSearchValues =
      value && (this.isMultiple() ? getSelectedOptions(value) : [value]);
    if (initialSearchValues && initialSearchValues.length > 0) {
      const metadata = {};
      const searchFieldsArray = getSearchFieldArray(field.get('search_fields'));
      const { payload } = await query(
        forID,
        collection,
        searchFieldsArray,
        '',
        file
      );
      const hits = payload.hits || [];
      const options = this.parseHitOptions(hits);
      const initialOptions = initialSearchValues
        .map(v => {
          const selectedOption = options.find(o => o.value === v);
          if (selectedOption.data) metadata[v] = selectedOption.data;
          return selectedOption;
        })
        .filter(Boolean);

      this.mounted && this.setState({ initialOptions });

      //set metadata
      this.mounted &&
        onChange(value, {
          [field.get('name')]: {
            [field.get('collection')]: metadata,
          },
        });
    }
  }

  componentWillUnmount() {
    console.log('componentWillUnmount');
    this.mounted = false;
  }

  onSortEnd =
    options =>
    ({ oldIndex, newIndex }) => {
      console.log('onSortEnd');
      const { onChange, field } = this.props;
      const value = options.map(optionToString);
      const newValue = arrayMove(value, oldIndex, newIndex);
      const metadata =
        (!isEmpty(options) && {
          [field.get('name')]: {
            [field.get('collection')]: {
              [last(newValue)]: last(options).data,
            },
          },
        }) ||
        {};
      onChange(fromJS(newValue), metadata);
    };

  handleChange = selectedOption => {
    console.log('handleChange');
    const { onChange, field } = this.props;

    if (this.isMultiple()) {
      const options = selectedOption;
      this.setState({ initialOptions: options.filter(Boolean) });
      const value = options.map(optionToString);
      const metadata =
        (!isEmpty(options) && {
          [field.get('name')]: {
            [field.get('collection')]: {
              [last(value)]: last(options).data,
            },
          },
        }) ||
        {};

      onChange(fromJS(value), metadata);
    } else {
      this.setState({ initialOptions: [selectedOption].filter(Boolean) });
      const value = optionToString(selectedOption);
      const metadata = selectedOption && {
        [field.get('name')]: {
          [field.get('collection')]: { [value]: selectedOption.data },
        },
      };
      onChange(value, metadata);
    }
  };

  parseNestedFields = (hit, field) => {
    console.log('parseNestedFields');
    const templateVars = stringTemplate.extractTemplateVars(field);
    // return non template fields as is
    if (templateVars.length <= 0) {
      return get(hit.data, field);
    }
    const data = stringTemplate.addFileTemplateFields(
      hit.path,
      fromJS(hit.data)
    );
    const value = stringTemplate.compileStringTemplate(
      field,
      null,
      hit.slug,
      data
    );
    return value;
  };

  isMultiple() {
    return this.props.field.get('multiple', false);
  }

  parseHitOptions = hits => {
    console.log('parseHitOptions');
    const { field } = this.props;
    const valueField = field.get('value_field');
    const displayField =
      field.get('display_fields') || List([field.get('value_field')]);
    const options = hits.reduce((acc, hit) => {
      const valuesPaths = stringTemplate.expandPath({
        data: hit.data,
        path: valueField,
      });
      console.log('return parseHitOptions');
      for (let i = 0; i < valuesPaths.length; i++) {
        const label = displayField
          .toJS()
          .map(key => {
            const displayPaths = stringTemplate.expandPath({
              data: hit.data,
              path: key,
            });
            return this.parseNestedFields(
              hit,
              displayPaths[i] || displayPaths[0]
            );
          })
          .join(' ');
        const value = this.parseNestedFields(hit, valuesPaths[i]);
        acc.push({ data: hit.data, value, label });
      }
      return acc;
    }, []);

    return options;
  };

  loadOptions = debounce((term, callback) => {
    console.log('loadOptions');
    const { field, query, forID } = this.props;
    const collection = field.get('collection');
    const optionsLength = field.get('options_length') || 20;
    const searchFieldsArray = getSearchFieldArray(field.get('search_fields'));
    const file = field.get('file');

    query(forID, collection, searchFieldsArray, term, file, optionsLength).then(
      ({ payload }) => {
        const hits = payload.hits || [];
        const options = this.parseHitOptions(hits);
        const uniq = uniqOptions(this.state.initialOptions, options);
        callback(uniq);
      }
    );
  }, 500);

  render() {
    const {
      value,
      field,
      forID,
      classNameWrapper,
      setActiveStyle,
      setInactiveStyle,
      queryHits,
    } = this.props;
    const isMultiple = this.isMultiple();
    const isClearable = !field.get('required', true) || isMultiple;

    const queryOptions = this.parseHitOptions(queryHits || []);
    const options = uniqOptions(this.state.initialOptions, queryOptions);
    const selectedValue = getSelectedValue({
      options,
      value,
      isMultiple,
    });

    return (
      <Creatable
        useDragHandle
        axis="xy"
        onSortEnd={this.onSortEnd(selectedValue)}
        distance={4}
        getHelperDimensions={({ node }) => node.getBoundingClientRect()}
        value={selectedValue}
        inputId={forID}
        cacheOptions
        defaultOptions
        loadOptions={this.loadOptions}
        onChange={this.handleChange}
        className={classNameWrapper}
        onFocus={setActiveStyle}
        onBlur={setInactiveStyle}
        styles={reactSelectStyles}
        isMulti={isMultiple}
        isClearable={isClearable}
        placeholder=""
      />
    );
  }
}
