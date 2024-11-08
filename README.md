# AMEA ILLUSTRATOR CEP
This is a Illustrator plugin (CEP) that helps us populating templates from user data.

## Excel
The main functionality of this plugin is to automatically create ready-to-print printing. These files are created with the help of an excel where templates are populated and combined into finished "jigs".

The excel file must contain some specific columns for this to work. User data may not be put in these columns, these are reserved for the use of this plugin.

| Column name | Required | Type                   | Description                                             |
| ----------- | -------- | ---------------------- | ------------------------------------------------------- |
| Name        | true     | string                 | A user-friendly name for the output file                |
| Quantity    | true     | number                 | How many outputs should be created                      |
| Template    | true     | string                 | Which template should be used when populating           |
| Ouput type  | true     | 'pdf' \| 'ai' \| 'svg' | In which format should the file be saved (pdf, ai, svg) |
| Jig         | false    | string                 | Which jig to put the output file into                   |
| Flags       | false    | string[]               | A JSON list of various [flags](#Flags) to apply         |
| (All other) | false    | string                 | Text och image that should populate the template. If image, it should be an link the the location of the image. |

## Flags
Flags are used to apply different functions to the document.

| Flag                     | description                           |
| ------------------------ | ------------------------------------- |
| mirror-horizontally      | Mirror the document horizontally      |
| mirror-vertically        | Mirror the document vertically        |
| rotate-clockwise         | Rotate the document clockwise         |
| rotate-counter-clockwise | Rotate the document counter clockwise |

## Templates
Add all wanted elements to the document. For every element that should not be editable, lock it. 
For all elements that should be editable, give them a suitable name. Multiple elements can have the same name (if they are based on the same data).

To change the color of an element based on the data, give the element a spot color with the name `AMEA-COLOR={color_name}`. Replace `{color_name}` with the data key that holds the final color. 

## Jigs

A jig can only accept a single size of template.
For each slot, an rectangle i created and named "slot", they have to be at top level.
Each slot has to be the exact size as the correponding template.

## Tips

### Debugging Unsigned Extensions

[https://github.com/Adobe-CEP/CEP-Resources/blob/master/CEP_11.x/Documentation/CEP%2011.1%20HTML%20Extension%20Cookbook.md#debugging-unsigned-extensions](https://github.com/Adobe-CEP/CEP-Resources/blob/master/CEP_11.x/Documentation/CEP%2011.1%20HTML%20Extension%20Cookbook.md#debugging-unsigned-extensions)

### Clear CEP cache. 
```bash
rm -r ~/Library/Caches/CSXS/cep_cache
```

### Fix ZXPSignCmd Permissions issues on Mac. 
```bash
chmod 700 node_modules/vite-cep-plugin/lib/bin/ZXPSignCmd
```