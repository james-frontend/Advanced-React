import React, { Component } from 'react';
import { graphql, gql } from 'react-apollo';
import { ALL_ITEMS_QUERY, CREATE_LINK_MUTATION } from '../queries';
import ErrorMessage from './ErrorMessage';

class CreateLink extends Component {
  state = {
    description: '',
    title: '',
    image: '',
    price: 0,
    fullPrice: 0,
    loading: false,
    error: {
      message: 'shit!',
    },
  };

  componentWillReceiveProps(nextProps) {
    console.log(nextProps);
  }

  uploadFile = async e => {
    const files = e.currentTarget.files;

    const data = new FormData();
    data.append('data', files[0]);

    // use the file endpoint
    const res = await fetch('https://api.graph.cool/file/v1/cj5xz8szs28930145gct82bdj', {
      method: 'POST',
      body: data,
    });
    const file = await res.json();
    console.log(file);
    this.setState({ image: file.id });
  };

  _createLink = async e => {
    e.preventDefault();
    // pull the values from state
    const { description, title, image, price, fullPrice } = this.state;
    // create a mutation
    // TODO: handle any errors
    // turn loading on
    this.setState({ loading: true });
    try {
      const res = await this.props.createLinkMutation({
        // pass in those variables from state
        variables: {
          description,
          title,
          price: parseInt(price),
          fullPrice,
          imageId: image,
        },
      });
    } catch (error) {
      this.setState({ error });
      console.log(error);
    }
    this.setState({ loading: false });
  };

  render() {
    return (
      <div>
        {this.state.loading ? 'LOADING...' : 'Ready!'}

        <ErrorMessage error={this.state.error} onButtonClick={() => this.setState({ error: {} })} />
        <form onSubmit={this._createLink}>
          <p>
            Image
            <input onChange={this.uploadFile} type="file" />
          </p>
          <p>
            Title
            <input
              value={this.state.title}
              onChange={e => this.setState({ title: e.target.value })}
              type="text"
              placeholder="A description for the link"
            />
          </p>
          <label>
            Price<input
              type="number"
              min="0"
              value={this.state.price}
              onChange={e => this.setState({ price: e.target.value })}
            />
          </label>
          <textarea
            value={this.state.description}
            onChange={e => this.setState({ description: e.target.value })}
            type="text"
            placeholder="The desc for this item"
          />
          <button type="submit">Submit</button>
        </form>
      </div>
    );
  }
}
// When we submit this mutation, we need to update our store - we have a few ways to do that:
// One - we can go nucular and run refetchQueries() which will just go get everything - this is easy, but at the cost of efficiency.

export default graphql(CREATE_LINK_MUTATION, {
  name: 'createLinkMutation',
  options: {
    // Easy, but slow
    // refetchQueries: ['AllLinksQuery']
    // This is much Better / efficient
    // Notice how the variable is called createItem - that is because createItem is the name of the query!
    update: (proxy, { data: { createItem } }) => {
      console.log({ createItem, ALL_ITEMS_QUERY });
      const data = proxy.readQuery({ query: ALL_ITEMS_QUERY });
      // data is our store, allItems is our sub-"state", it's just an array. We can just add it to
      data.allItems.unshift(createItem);
      // and then "set state", so it will update on the page. This will update the cache for us!
      proxy.writeQuery({ query: ALL_ITEMS_QUERY, data });
    },
  },
})(CreateLink);
