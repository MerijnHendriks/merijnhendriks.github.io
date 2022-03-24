# h1 Heading

## h2 Heading

### h3 Heading

#### h4 Heading

##### h5 Heading

###### h6 Heading

## Horizontal Rules

___

## Emphasis

**This is bold text**
*This is italic text*
~~Strikethrough~~

## Blockquotes

> Blockquote woop woop!
>> ...it can also be nested by using additional greater-than signs right next to each other...

## Lists

Unordered

- Create a list by starting a line with `+`, `-`, or `*`
- Sub-lists are made by indenting 2 spaces:
  - Marker character change forces new list start:
    - Ac tristique libero volutpat at
    - Facilisis in pretium nisl aliquet
    - Nulla volutpat aliquam velit
- Very easy!

Ordered

1. Lorem ipsum dolor sit amet
2. Consectetur adipiscing elit
3. Integer molestie lorem at massa

## Code

Inline `code`

Syntax highlighting

```c
#include <stdio.h>
#include <stdlib.h>

int main()
{
    printf("hello world!");
    return EXIT_SUCCESS;
}
```

Unformatted

```
#include <stdio.h>
#include <stdlib.h>

int main()
{
    printf("hello world!");
    return EXIT_SUCCESS;
}
```

## Tables

Option | Description
------ | -----------
data   | path to data files to supply the data that will be passed into templates.
engine | engine to be used for processing templates. Handlebars is the default.
ext    | extension to be used for dest files.

Inverted table

Option | Description
-----: | ----------:
data   | path to data files to supply the data that will be passed into templates.
engine | engine to be used for processing templates. Handlebars is the default.
ext    | extension to be used for dest files.

Centered table

Option | Description
:----: | :---------:
data   | path to data files to supply the data that will be passed into templates.
engine | engine to be used for processing templates. Handlebars is the default.
ext    | extension to be used for dest files.

## Links

[link text](https://www.cortoso.com)

## Images

![Ganyu](./assets/img/bg/light-small.jpg)

## Footnote

This is an example of how to create a footnote[^1] in Markdown.

[^1]: First Footnote