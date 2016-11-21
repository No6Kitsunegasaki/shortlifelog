var CommentBox = React.createClass({

  loadCommentsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      success: function(result) {
        this.setState({data: result.data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleTapeChange: function(e) {
    this.setState({
      selectedTape: e.target.value
    });
  },
  handleCommentSubmit: function(comment) {
    comment['tape_id'] = this.state.selectedTape;
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: comment,
      success: function(data) {
        console.log('success');
        console.log(data);
        this.setState({data: this.state.data.concat([data])});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {
      data: [],
      selectedTape: '1'
    };
  },
  componentDidMount: function() {
    this.loadCommentsFromServer();
    //setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className="commentBox">
        <h2>comment</h2>
        <CommentList data={this.state.data} />
        <TapeForm selectedTape={this.state.selectedTape} onTapeChange={this.handleTapeChange} />
        <CommentForm onCommentSubmit={this.handleCommentSubmit} />
      </div>
    );
  }
});

var CommentList = React.createClass({

  render: function() {
    var commentNodes = this.props.data.map(function (comment) {
      return (
        <Comment key={comment.id} tape_id={comment.tape_id} author={comment.author}>
          {comment.text}
        </Comment>
      );
    });
    return (
      <div className="commentList">
        {commentNodes}
      </div>
    );
  }
});

var TapeForm = React.createClass({

  render: function() {
    return (
      <form>
        <ul>
          <li>
            <label>
              <input type="radio" value="1" checked={this.props.selectedTape === '1'} onChange={this.props.onTapeChange} />
              tape_1
            </label>
          </li>
          <li>
            <label>
              <input type="radio" value="2" checked={this.props.selectedTape === '2'} onChange={this.props.onTapeChange} />
              tape_2
            </label>
          </li>
        </ul>
      </form>
    );
  }
});

var CommentForm = React.createClass({

  handleSubmit: function(e) {
    e.preventDefault();
    var author = this.refs.author.value.trim();
    var text = this.refs.text.value.trim();
    if (!text || !author) {
      return;
    }
    this.props.onCommentSubmit({author: author, text: text});
    //this.refs.author.value = ''; // いちいちクリアしない
    this.refs.text.value = '';
    return;
  },
  render: function() {
    return (
      <form className="commentForm" onSubmit={this.handleSubmit}>
        <ul>
          <li>
            <input type="text" placeholder="Your name" ref="author" />
          </li>
          <li>
            <input type="text" placeholder="Say something..." ref="text" />
          </li>
        </ul>
        <input type="submit" value="Post" />
      </form>
    );
  }
});

var Comment = React.createClass({

  render: function() {
    var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    return (
      <div className="comment">
        <span className="tape"> {this.props.tape_id} </span>
        <span className="author"> {this.props.author} </span>
        <span className="text" dangerouslySetInnerHTML={{__html: rawMarkup}} />
      </div>
    );
  }
});

