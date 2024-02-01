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

## Flags
Flags are used to apply different functions to the document.

| Flag                | description                      |
| ------------------- | -------------------------------- |
| mirror-horizontally | Mirror the document horizontally |
| mirror-vertically   | Mirror the document vertically   |

## Scripts

### Clear CEP cache. 
```bash
rm -r ~/Library/Caches/CSXS/cep_cache
```

### Fix ZXPSignCmd Permissions issues on Mac. 
```bash
chmod 700 node_modules/vite-cep-plugin/lib/bin/ZXPSignCmd
```