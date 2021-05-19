# Code style preference

19-05-2020: initial version

## Introduction

In the past years, I've read many different programming styles and had the chance to try out a couple of languages.  
There is always one thing that stood out to me: everyone seems to use a distinctly different programming style.  
In today's article I'll explain the way I would ideally write code and why.

## History

In the early days of programming, the size of your source files mattered alot.  
If your floppy disk wasn't capable of holding your full source code, you had to trim it down in one way or another.  
Spaces became tabs, cost-saving programming features such as multiple initialization was introduced and more just to combat the size limit.  
In modern days these things don't matter as much anymore as the file size we can use for our programs became much larger over time.  
Now the focus is readability and how fast you can write your code.

## What I use

```unformatted
// psuedo code

import Std;

class Program
{
    void main(string[] args)
    {
        bool isOn = true;
        string cookies = [
            "choco chip cookie",
            "biscuit"
        ];

        if (isOn)
        {
            Std.print("hello world!");
        }

        for (string cookie : cookies)
        {
            Std.print($"hello {cookie}!");
        }
    }
}
```

### Brace style

I use the allman brace style to have consistently 1 operation on each line, with clear distinction between scope.  
While it seems very attractive to have multiple operations and/or scope denotion on the same line, it's not as easy to debug with the human eye.  
To me this is perhaps the most important part, as we spend most of our time reading our own code after all.

### Indentation

I really prefer the 4 spaces in indentation size as it decently denotes scope without being exaggerated.  
With 2 spaces there isn't enough indentation for the eye to notice a clear difference.  
With 8 spaces there is so much space that it becomes distracting.

All my IDE's are configured to represent a tab as 4 spaces.  
When I save the file, my IDE automatically turns it into 4 spaces.  
This way the source will always be in the correct indentation level when opened in another IDE that isn't configured correctly.

### Structs / classes

My naming is quite strict; all must be pascal case and only letters unless numbers are strictly required.
I never use special characters like `_` as they make it harder on the eye to see the object as one instance.
I make no distinction between public, protected private, global or enums.

### Variables / fields

To make my life easier for reading my source, I make sure to be consistent in where and how I intialize my variables.  
The big advantage in declaring and initializing your variables at the beginning of the scope is that you know it's longlivity.  

In addition, single initialization means less time refactoring and even preventing obscure bugs in ANSI-C with pointers!  
That one line defines exactly what you need to know opposed to having to memorize or read back what it truly is.

I stick to the same naming scheme for as for structs, but use camel case instead.

### Functions / Methods

It is much easier to figure out what something does if you know it in advance.  
In addition, in ANSI-C it also means you don't need to add a function prototype in your source file for the compiler to be aware of the order.  
Why? Because it's already declared when it wants to use it.  
I stick to the same naming scheme for as for structs, but use camel case instead.

## Conclusion

I would stick with the language default or company style when required, but if I had a choice I would pick the following:

**thing**   | **what I do**
----------- | ---------------------------------------------------------------------------------------------------------
Brace style | Allman, 1 operation or scope denotion on each line
Indentation | 4 spaces, tabs when programming and convert to spaces when sharing the source
Structs     | Pascal case, avoid numbers, never use special characters
Variables   | Camel case, avoid numbers, never use special characters, single initialization, at the start of the scope
Functions   | Camel case, avoid numbers, never use special characters, bottom-up order
