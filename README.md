# WW-FORM-INPUT

This is an element for Weweb, to display an input.
It make the input type and debounce value bindable.

## Installation

To run locally, first install all dependencies with `npm install`.

## Start

To serve locally, run `npm run serve --port=[PORT]`, and then go to Weweb editor, open developper popup and add localhost:[PORT] as custom element.

## Build

Before release, you can check build error by running `npx weweb build name="ww-input-basic" type="wwobject"`.

Note that the CLI reads bare `name=` / `type=` arguments, so the dash-prefixed form (`--name=...`) fails with `arg 'name="name"' not specified`.

## Changelog

- 19/08/2026 - Keep a disabled input selectable on the editor canvas
- 19/08/2026 - Size the auto-grow textarea with CSS (`field-sizing`), bounded by the min/max height in the style panel — replaces the max rows cap
- 17/08/2026 - Add textarea auto grow, with an optional max rows cap
- 07/06/2026 - Add autofocus
- 25/05/2026 - Add vertical resize for textarea
- 17/05/2026 - Add invalid state
- 17/05/2026 - Add disabled state
- 17/05/2026 - Add File type
