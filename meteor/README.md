Packaging [Sortable](http://rubaxa.github.io/Sortable/) for [Meteor.js](http://meteor.com).


# Meteor

If you're new to Meteor, here's what the excitement is all about -
[watch the first two minutes](https://www.youtube.com/watch?v=fsi0aJ9yr2o); you'll be hooked by 1:28.
That screencast is from 2012. In the meantime, Meteor has become a mature JavaScript-everywhere web
development framework. Read more at [Why Meteor](http://www.meteorpedia.com/read/Why_Meteor).

# Usage

Simplest invocation - order will be lost when the page is refreshed:

    {{sortable <collection|cursor|array>}}

Persist the sort order in the 'order' field of each document in the collection:
    
    {{sortable <collection|cursor|array> sortField="order"}}

Pass options:

    {{sortable items=<collection|cursor|array> option1=value1 option2=value2...}}
    {{sortable items=<collection|cursor|array> options=myOptions}}

For available options, please refer to [the main README](../README.md#options). You can pass them directly
or under the `options` object. Direct options (`key=value`) override those in `options`. It is best
to pass presentation-related options directly, and functionality-related settings in an `options`
object, as this will enable designers to work without needing to inspect the JavaScript code:

    <template name="myTemplate">
      ...
      {{sortable items=Players handle=".sortable-handle" ghostClass="sortable-ghost" options=playerOptions}}
    </template>

Define the options in a helper for the template that calls Sortable:

```js
Template.myTemplate.helpers({
    playerOptions: function () {
        return {
            group: {
                name: "league",
                pull: true,
                put: false
            },
            sort: false
        };
    }
});
```

### Reactive features

Each document in the collection will be decorated with a field called `sortable-order`. Don't depend
on a particular format for this field; it *is* though guaranteed that a `sort` will produce
lexicographical order, and that the order will be maintained after an arbitrary number of reorderings,
unlike with [other solutions](http://differential.com/blog/sortable-lists-in-meteor-using-jquery-ui).

For arrays, the elements will be sorted in-place.

TODO sparse arrays.

TODO indexes/order when new element arrives from another list with dame data-id

    {{sortable <cursor|array> setting1=value1, group.pull=true etc.}}

* new elements arriving in the collection will update the list as you expect
* elements removed from the collection will be removed from the list
* animated transitions

# Issues

If you encounter an issue while using this package, please CC @dandv when you file it in this repo.


# DONE

* Instantiation test


# TODO

* Meteor collection backing
* Tests ensuring correct rendering with Meteor dynamic templates
