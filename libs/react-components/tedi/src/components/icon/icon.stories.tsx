import { Meta, StoryFn, StoryObj } from '@storybook/react';
import classNames from 'classnames';

import { Icon, IconProps } from './icon';

/**
 * [Figma ↗](https://www.figma.com/file/jWiRIXhHRxwVdMSimKX2FF/TEDI-Design-System-(draft)?type=design&node-id=45-30752&mode=dev)<br/>
 * [Zeroheight ↗](https://tedi.zeroheight.com/styleguide/s/118912/p/28835d-icons)<hr/>
 * [Official Google Material Icons homepage icons ↗](https://fonts.google.com/icons?icon.set=Material+Icons)<br/>
 * [Material Icons for Developers ↗](https://mui.com/material-ui/material-icons/)<br/>
 * [Material Icons Figma ↗](https://www.figma.com/community/file/1014241558898418245/material-design-icons?searchSessionId=lvxhc4l5-a6)<br/>
 * [Figma Material Symbols plugin ↗](https://www.figma.com/community/plugin/740272380439725040/material-design-icons)
 */
const meta: Meta<typeof Icon> = {
  title: 'Tedi-components/Base/Icon',
  component: Icon,
};

export default meta;
type Story = StoryObj<TemplateMultipleProps>;

const sizeArray: IconProps['size'][] = [8, 12, 16, 18, 24, 36, 48];
const colorArray: IconProps['color'][] = ['primary', 'secondary', 'tertiary', 'success', 'warning', 'danger', 'white'];

interface TemplateMultipleProps<
  Type = IconProps['size'] | IconProps['color'] | IconProps['type'] | IconProps['background']
> extends IconProps {
  array: Type[];
  property: keyof IconProps;
  items: {
    name: string;
    property: string;
    color: IconProps['color'];
    background: IconProps['background'];
    size: IconProps['size'];
  }[];
}

const TemplateRow: StoryFn<TemplateMultipleProps> = (args) => {
  const { array, property, ...iconProps } = args;

  return (
    <div>
      <div className="row padding-14-16">Outlined</div>
      <div className="row">
        {array.map((value, key) => (
          <div key={key} className="column">
            <div className={classNames({ 'with-background': value === 'white' })}>
              <Icon {...iconProps} {...{ [property]: value }} />
            </div>
          </div>
        ))}
      </div>
      <div className="row padding-14-16">Filled</div>
      <div className="row">
        {array.map((value, key) => (
          <div key={key} className="column">
            <div className={classNames({ 'with-background': value === 'white' })}>
              <Icon {...iconProps} {...{ [property]: value }} type="filled" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TemplateColumn: StoryFn<TemplateMultipleProps> = (args) => {
  const { array, property, ...iconProps } = args;

  return (
    <div className="example-list w-50">
      {array.map((value, key) => (
        <div className={`row ${key === array.length - 1 ? '' : 'border-bottom'} padding-14-16`} key={key}>
          <div className="column w-50">
            <div className="display-flex">
              {value?.toString()}&nbsp;{value === 24 && <small className="example-text--secondary">default</small>}
            </div>
          </div>
          <div className="column">
            <div className="display-flex">
              <Icon {...iconProps} {...{ [property]: value }} display="inline" />
              &nbsp;
              <Icon {...iconProps} {...{ [property]: value }} display="inline" type="filled" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const TemplateColumnWithMultipleVariants: StoryFn<TemplateMultipleProps> = (args) => {
  const { items } = args;

  return (
    <div className="example-list w-50">
      {items.map((item, key) => (
        <div className={`row ${key === items.length - 1 ? '' : 'border-bottom'} padding-14-16`} key={key}>
          <div className="column w-50">
            <div className="display-flex">
              {item.size?.toString()}&nbsp;
              {item.size === 24 && <small className="example-text--secondary">default</small>}
            </div>
          </div>
          <div className="column">
            <div className="display-flex">
              <Icon
                {...{ size: item.size, background: item.background, name: item.name, color: item.color }}
                display="inline"
              />
              &nbsp;
              <Icon
                {...{ size: item.size, background: item.background, name: item.name, color: item.color }}
                display="inline"
                type="filled"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const TemplateColumnWithBackgroundCircleVarians: StoryFn<TemplateMultipleProps> = (args) => {
  return (
    <div className="row w-50">
      <div className="column">
        <div className="row">
          <div className="column">
            <Icon name="Vaccines" background="distinctive-primary" color="white" />
          </div>
          <div className="column">
            <Icon name="Info" background="distinctive-primary" color="white" size={16} />
          </div>
          <div className="column">
            <Icon name="Vaccines" background="distinctive-secondary" color="secondary" />
          </div>
          <div className="column">
            <Icon name="Info" background="distinctive-secondary" color="secondary" size={16} />
          </div>
        </div>
      </div>
      <div className="column">
        <div className="row with-background">
          <div className="column">
            <Icon name="Vaccines" background="primary" color="secondary" />
          </div>
          <div className="column">
            <Icon name="Info" background="primary" color="secondary" size={16} />
          </div>
          <div className="column">
            <Icon name="Vaccines" background="secondary" color="white" />
          </div>
          <div className="column">
            <Icon name="Info" background="secondary" color="white" size={16} />
          </div>
        </div>
      </div>
    </div>
  );
};

const Template: StoryFn<IconProps> = (args) => <Icon {...args} />;

export const Default: Story = {
  render: Template,

  args: {
    name: 'AccountCircle',
  },
};

export const Sizes: Story = {
  name: 'Icon Size',
  render: TemplateColumn,

  args: {
    name: 'AccountCircle',
    property: 'size',
    color: 'primary',
    array: sizeArray,
  },
};

export const SizesWithBackground: Story = {
  name: 'Icon size inside background',
  render: TemplateColumnWithMultipleVariants,
  args: {
    items: [
      {
        name: 'Info',
        property: 'size',
        color: 'secondary',
        background: 'distinctive-secondary',
        size: 16,
      },
      {
        name: 'Vaccines',
        property: 'size',
        color: 'secondary',
        background: 'distinctive-secondary',
        size: 24,
      },
    ],
  },
};

export const Colors: Story = {
  render: TemplateRow,
  name: 'Icon colors',

  args: {
    name: 'AccountCircle',
    property: 'color',
    array: colorArray,
    size: 48,
  },
};

export const Backgrounds: Story = {
  render: TemplateColumnWithBackgroundCircleVarians,
  name: 'Icon background colors',
};
