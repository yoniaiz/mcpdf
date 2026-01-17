# PDF Form Field Patterns

> Patterns and techniques for detecting and handling PDF form fields.

## AcroForm Field Types

PDF forms use AcroForm technology. Here are the field types and how to handle them:

### Text Fields (PDFTextField)

**Characteristics:**
- Single-line or multi-line text input
- May have max length constraint
- May have text alignment (left, center, right)
- May have default value

**Detection:**
```typescript
if (field instanceof PDFTextField) {
  const isMultiline = field.isMultiline();
  const maxLength = field.getMaxLength();
  const text = field.getText();
}
```

**Filling:**
```typescript
field.setText('John Doe');
```

### Checkboxes (PDFCheckBox)

**Characteristics:**
- Boolean state (checked/unchecked)
- Has an "on" value (usually "Yes" or "On")
- Can be part of a group but acts independently

**Detection:**
```typescript
if (field instanceof PDFCheckBox) {
  const isChecked = field.isChecked();
}
```

**Filling:**
```typescript
field.check();   // Check the box
field.uncheck(); // Uncheck the box
```

### Radio Button Groups (PDFRadioGroup)

**Characteristics:**
- Mutually exclusive options
- Grouped under one field name
- Each option has a value

**Detection:**
```typescript
if (field instanceof PDFRadioGroup) {
  const options = field.getOptions(); // ['male', 'female', 'other']
  const selected = field.getSelected(); // 'male' or undefined
}
```

**Filling:**
```typescript
field.select('female'); // Select by option value
```

### Dropdown Lists (PDFDropdown)

**Characteristics:**
- Single or multi-select
- Predefined list of options
- May allow custom values (editable)

**Detection:**
```typescript
if (field instanceof PDFDropdown) {
  const options = field.getOptions();
  const selected = field.getSelected(); // Array for multi-select
  const isEditable = field.isEditable();
}
```

**Filling:**
```typescript
field.select('United States'); // Single select
```

### Option Lists (PDFOptionList)

**Characteristics:**
- Multi-select list box
- Shows multiple options at once
- Less common than dropdowns

**Detection:**
```typescript
if (field instanceof PDFOptionList) {
  const options = field.getOptions();
  const selected = field.getSelected();
}
```

**Filling:**
```typescript
field.select(['Option1', 'Option2']); // Multi-select
```

## Field Metadata Extraction

### Getting All Fields

```typescript
const form = pdfDoc.getForm();
const fields = form.getFields();

for (const field of fields) {
  console.log({
    name: field.getName(),
    required: field.isRequired(),
    readOnly: field.isReadOnly(),
    exported: field.isExported()
  });
}
```

### Getting Field by Name

```typescript
// Throws if not found
const field = form.getTextField('firstName');

// Returns undefined if not found
const field = form.getFieldMaybe('firstName');
```

### Field Widget Information

Each field can have multiple widgets (visual representations):

```typescript
const widgets = field.acroField.getWidgets();
for (const widget of widgets) {
  const rect = widget.getRectangle();
  console.log({
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height
  });
}
```

## Determining Field Page

Fields in pdf-lib don't directly expose their page number. Here's how to find it:

```typescript
function getFieldPage(pdfDoc: PDFDocument, field: PDFField): number {
  const widgets = field.acroField.getWidgets();
  if (widgets.length === 0) return 1;
  
  const firstWidget = widgets[0];
  const widgetPageRef = firstWidget.P();
  
  if (!widgetPageRef) return 1;
  
  const pages = pdfDoc.getPages();
  for (let i = 0; i < pages.length; i++) {
    if (pages[i].ref.equals(widgetPageRef)) {
      return i + 1;
    }
  }
  
  return 1;
}
```

## Field Appearance

### Text Field Appearance

```typescript
const textField = form.getTextField('name');

// Get/set default appearance
const da = textField.acroField.getDefaultAppearance();

// Common appearance operations
textField.setFontSize(12);
textField.setAlignment(TextAlignment.Left);
```

### Checkbox Appearance

Checkboxes use predefined appearances:
- `/Yes` - Checked state
- `/Off` - Unchecked state

### Handling Different Checkbox "On" Values

Some PDFs use different values for the checked state:

```typescript
function getCheckboxOnValue(field: PDFCheckBox): string {
  const widgets = field.acroField.getWidgets();
  for (const widget of widgets) {
    const ap = widget.getAppearances();
    if (ap?.normal) {
      const keys = Object.keys(ap.normal);
      const onValue = keys.find(k => k !== 'Off');
      if (onValue) return onValue;
    }
  }
  return 'Yes';
}
```

## Field Flags

PDF fields have flags that control behavior:

```typescript
const flags = field.acroField.getFlags();

// Common flags
const isReadOnly = (flags & 1) !== 0;      // Bit 1
const isRequired = (flags & 2) !== 0;      // Bit 2
const isNoExport = (flags & 4) !== 0;      // Bit 3

// Text field specific
const isMultiline = (flags & 4096) !== 0;  // Bit 13
const isPassword = (flags & 8192) !== 0;   // Bit 14
const isFileSelect = (flags & 1048576) !== 0; // Bit 21
```

## Static Form Detection (Future Phase)

For PDFs without AcroForms, detect visual patterns:

### Underline Pattern Detection

```typescript
const UNDERLINE_PATTERNS = [
  /^(.+?):\s*_{3,}\s*$/,           // "Label: ___"
  /^(.+?)\s+_{3,}\s*$/,            // "Label ___"
  /^(.+?):\s*\.{3,}\s*$/,          // "Label: ..."
  /\[(.+?)\]\s*_{3,}/,             // "[Label] ___"
];

function detectUnderlineFields(text: string): string[] {
  const fields: string[] = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    for (const pattern of UNDERLINE_PATTERNS) {
      const match = line.match(pattern);
      if (match) {
        fields.push(match[1].trim());
        break;
      }
    }
  }
  
  return fields;
}
```

### Checkbox Pattern Detection

```typescript
const CHECKBOX_PATTERNS = [
  /^\s*\[\s*\]\s*(.+)$/,           // "[ ] Option"
  /^\s*☐\s*(.+)$/,                 // "☐ Option"
  /^\s*□\s*(.+)$/,                 // "□ Option"
  /^\s*○\s*(.+)$/,                 // "○ Option" (radio style)
];
```

### Section Header Detection

```typescript
const SECTION_PATTERNS = [
  /^#{1,6}\s+(.+)$/,               // Markdown headers
  /^([A-Z][A-Z\s]+):?\s*$/,        // ALL CAPS HEADERS
  /^\d+\.\s+([A-Z].+)$/,           // "1. Section Name"
  /^Part\s+\d+:?\s*(.+)$/i,        // "Part 1: Section"
];
```

## Common PDF Form Issues

### Issue: Field Names with Dots

PDF field names can contain dots which pdf-lib interprets as hierarchy:

```typescript
// Field named "form.section.field" might be nested
const field = form.getFieldMaybe('form.section.field');

// Or try the full path
const field = form.getField('form.section.field');
```

### Issue: Flatten vs Editable

After filling, you may want to flatten the form (make it non-editable):

```typescript
form.flatten(); // Makes all fields non-editable
await pdfDoc.save();
```

### Issue: Font Embedding

When filling text fields, ensure fonts are embedded:

```typescript
// pdf-lib handles this automatically for standard fonts
// For custom fonts:
const font = await pdfDoc.embedFont(customFontBytes);
textField.updateAppearances(font);
```

### Issue: Large Text in Small Fields

Text that's too long for a field may be truncated:

```typescript
// Check field dimensions before filling
const widgets = field.acroField.getWidgets();
const rect = widgets[0]?.getRectangle();
const availableWidth = rect?.width || 100;

// Estimate if text will fit (rough calculation)
const charWidth = 6; // Approximate for 12pt font
const maxChars = Math.floor(availableWidth / charWidth);
```

## PDF Security

### Detecting Protected PDFs

pdf-lib throws on protected PDFs during load:

```typescript
try {
  const pdfDoc = await PDFDocument.load(pdfBytes);
} catch (error) {
  if (error.message.includes('encrypted')) {
    throw new PdfProtectedError();
  }
  throw error;
}
```

### Permissions

Some PDFs allow viewing but restrict modification:

```typescript
// pdf-lib will fail to modify if permissions don't allow it
// This is checked during save()
try {
  await pdfDoc.save();
} catch (error) {
  if (error.message.includes('permission')) {
    throw new Error('PDF modification not permitted');
  }
}
```

## Best Practices

1. **Always use `getFieldMaybe`** when field existence is uncertain
2. **Check field type before casting** to avoid runtime errors
3. **Handle missing widgets gracefully** - some fields may have no visual representation
4. **Preserve original files** - always save to new path
5. **Test with real forms** - synthetic test PDFs may not cover all edge cases
6. **Log field names** - helps debugging when fields aren't found
