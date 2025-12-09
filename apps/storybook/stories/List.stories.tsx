import { ListItem, OrderedList, Paragraph, UnorderedList } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof UnorderedList> = {
  title: "Components/List",
  component: UnorderedList,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Styled list components (UnorderedList, OrderedList, ListItem) with customizable styles and spacing. Perfect for content lists, navigation, and structured data.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof UnorderedList>;

/**
 * Basic unordered list with default disc bullets
 */
export const UnorderedBasic: Story = {
  render: () => (
    <UnorderedList>
      <ListItem>
        Konzeption, Moderation, Organisation und Durchführung eines
        Radioprojekts.
      </ListItem>
      <ListItem>
        Verantwortlich für Planung, Programminhalte und Teamkoordination.
      </ListItem>
      <ListItem>
        Betreuung einer Praktikantin (Leitungs- & Mentoringerfahrung).
      </ListItem>
    </UnorderedList>
  ),
};

/**
 * Unordered list with different bullet styles
 */
export const UnorderedVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <h3 style={{ marginBottom: "1rem" }}>Disc (Default)</h3>
        <UnorderedList listStyle="disc">
          <ListItem>First item</ListItem>
          <ListItem>Second item</ListItem>
          <ListItem>Third item</ListItem>
        </UnorderedList>
      </div>

      <div>
        <h3 style={{ marginBottom: "1rem" }}>Circle</h3>
        <UnorderedList listStyle="circle">
          <ListItem>First item</ListItem>
          <ListItem>Second item</ListItem>
          <ListItem>Third item</ListItem>
        </UnorderedList>
      </div>

      <div>
        <h3 style={{ marginBottom: "1rem" }}>Square</h3>
        <UnorderedList listStyle="square">
          <ListItem>First item</ListItem>
          <ListItem>Second item</ListItem>
          <ListItem>Third item</ListItem>
        </UnorderedList>
      </div>

      <div>
        <h3 style={{ marginBottom: "1rem" }}>None</h3>
        <UnorderedList listStyle="none">
          <ListItem>First item</ListItem>
          <ListItem>Second item</ListItem>
          <ListItem>Third item</ListItem>
        </UnorderedList>
      </div>
    </div>
  ),
};

/**
 * Basic ordered list with decimal numbers
 */
export const OrderedBasic: Story = {
  render: () => (
    <OrderedList>
      <ListItem>
        Konzeption, Moderation, Organisation und Durchführung eines
        Radioprojekts.
      </ListItem>
      <ListItem>
        Verantwortlich für Planung, Programminhalte und Teamkoordination.
      </ListItem>
      <ListItem>
        Betreuung einer Praktikantin (Leitungs- & Mentoringerfahrung).
      </ListItem>
    </OrderedList>
  ),
};

/**
 * Ordered list with different numbering styles
 */
export const OrderedVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <h3 style={{ marginBottom: "1rem" }}>Decimal (Default)</h3>
        <OrderedList listStyle="decimal">
          <ListItem>First item</ListItem>
          <ListItem>Second item</ListItem>
          <ListItem>Third item</ListItem>
        </OrderedList>
      </div>

      <div>
        <h3 style={{ marginBottom: "1rem" }}>Lower Alpha</h3>
        <OrderedList listStyle="lower-alpha">
          <ListItem>First item</ListItem>
          <ListItem>Second item</ListItem>
          <ListItem>Third item</ListItem>
        </OrderedList>
      </div>

      <div>
        <h3 style={{ marginBottom: "1rem" }}>Upper Roman</h3>
        <OrderedList listStyle="upper-roman">
          <ListItem>First item</ListItem>
          <ListItem>Second item</ListItem>
          <ListItem>Third item</ListItem>
        </OrderedList>
      </div>

      <div>
        <h3 style={{ marginBottom: "1rem" }}>Lower Roman</h3>
        <OrderedList listStyle="lower-roman">
          <ListItem>First item</ListItem>
          <ListItem>Second item</ListItem>
          <ListItem>Third item</ListItem>
        </OrderedList>
      </div>
    </div>
  ),
};

/**
 * Lists with different sizes
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <h3 style={{ marginBottom: "1rem" }}>Small (Default)</h3>
        <UnorderedList size="sm">
          <ListItem>Small text item</ListItem>
          <ListItem>Another small item</ListItem>
        </UnorderedList>
      </div>

      <div>
        <h3 style={{ marginBottom: "1rem" }}>Medium</h3>
        <UnorderedList size="md">
          <ListItem>Medium text item</ListItem>
          <ListItem>Another medium item</ListItem>
        </UnorderedList>
      </div>

      <div>
        <h3 style={{ marginBottom: "1rem" }}>Large</h3>
        <UnorderedList size="lg">
          <ListItem>Large text item</ListItem>
          <ListItem>Another large item</ListItem>
        </UnorderedList>
      </div>
    </div>
  ),
};

/**
 * Lists with different spacing between items
 */
export const Spacing: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <h3 style={{ marginBottom: "1rem" }}>No Spacing</h3>
        <UnorderedList spacing="0">
          <ListItem>First item</ListItem>
          <ListItem>Second item</ListItem>
          <ListItem>Third item</ListItem>
        </UnorderedList>
      </div>

      <div>
        <h3 style={{ marginBottom: "1rem" }}>Default Spacing (2)</h3>
        <UnorderedList spacing="2">
          <ListItem>First item</ListItem>
          <ListItem>Second item</ListItem>
          <ListItem>Third item</ListItem>
        </UnorderedList>
      </div>

      <div>
        <h3 style={{ marginBottom: "1rem" }}>Large Spacing (4)</h3>
        <UnorderedList spacing="4">
          <ListItem>First item</ListItem>
          <ListItem>Second item</ListItem>
          <ListItem>Third item</ListItem>
        </UnorderedList>
      </div>
    </div>
  ),
};

/**
 * Nested lists
 */
export const NestedLists: Story = {
  render: () => (
    <UnorderedList>
      <ListItem>
        First level item
        <UnorderedList listStyle="circle">
          <ListItem>Second level item</ListItem>
          <ListItem>
            Second level item with nested list
            <UnorderedList listStyle="square">
              <ListItem>Third level item</ListItem>
              <ListItem>Third level item</ListItem>
            </UnorderedList>
          </ListItem>
        </UnorderedList>
      </ListItem>
      <ListItem>First level item</ListItem>
    </UnorderedList>
  ),
};

/**
 * Lists with paragraph content
 */
export const WithParagraphs: Story = {
  render: () => (
    <UnorderedList>
      <ListItem>
        <Paragraph maxWidth={false}>
          Konzeption, Moderation, Organisation und Durchführung eines
          Radioprojekts.
        </Paragraph>
      </ListItem>
      <ListItem>
        <Paragraph maxWidth={false}>
          Verantwortlich für Planung, Programminhalte und Teamkoordination.
        </Paragraph>
      </ListItem>
      <ListItem>
        <Paragraph maxWidth={false}>
          Betreuung einer Praktikantin (Leitungs- & Mentoringerfahrung).
        </Paragraph>
      </ListItem>
    </UnorderedList>
  ),
};

/**
 * Mixed ordered and unordered nested lists
 */
export const MixedNested: Story = {
  render: () => (
    <OrderedList>
      <ListItem>
        First ordered item
        <UnorderedList>
          <ListItem>Nested unordered item</ListItem>
          <ListItem>Another nested unordered item</ListItem>
        </UnorderedList>
      </ListItem>
      <ListItem>
        Second ordered item
        <OrderedList listStyle="lower-alpha">
          <ListItem>Nested ordered item a</ListItem>
          <ListItem>Nested ordered item b</ListItem>
        </OrderedList>
      </ListItem>
      <ListItem>Third ordered item</ListItem>
    </OrderedList>
  ),
};
