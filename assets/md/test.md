# h1 Heading

## h2 Heading

### h3 Heading

#### h4 Heading

##### h5 Heading

###### h6 Heading

## Horizontal Rules

___

---

***

## Emphasis

**This is bold text**
__This is bold text__
*This is italic text*
_This is italic text_
~~Strikethrough~~

## Blockquotes

> Blockquote woop woop!

Nestled

> Blockquotes can also be nested...
>> ...by using additional greater-than signs right next to each other...
> > > ...or with spaces between arrows.

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

Start numbering with offset:

57. foo
1. bar

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

```bollocks
#include <stdio.h>
#include <stdlib.h>

int main()
{
    printf("hello world!");
    return EXIT_SUCCESS;
}
```

diff

```diff
     #include <stdio.h>
     #include <stdlib.h>

     int main()
     {
         printf("hello world!");
-        return 0;
+        return EXIT_SUCCESS;
     }
```

shell

```shell
cd /usr/local/etc
cp php.ini php.ini.bak
vi php.ini
```

## Tables

Option | Description
------ | -----------
data   | path to data files to supply the data that will be passed into templates.
engine | engine to be used for processing templates. Handlebars is the default.
ext    | extension to be used for dest files.

Inverted table
Hello world?

Option | Description
-----: | ----------:
data   | path to data files to supply the data that will be passed into templates.
engine | engine to be used for processing templates. Handlebars is the default.
ext    | extension to be used for dest files.

## Links

[link text](http://dev.nodeca.com)

Autoconverted link https://github.com/nodeca/pica (enable linkify to see)

## Images

![Ninja](https://octodex.github.com/images/dojocat.jpg)
![Stormtroopocat](https://octodex.github.com/images/stormtroopocat.jpg "The Stormtroopocat")
