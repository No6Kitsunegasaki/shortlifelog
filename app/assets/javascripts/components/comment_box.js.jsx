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
    var now = new Date();
    comment['posted_time'] = now.getTime() - this.state.startRec;
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
  play: function() {
    var now = new Date();
    var playerTime = now.getTime() - this.state.startPlay;
    this.setState({
      playerTime: playerTime
    });
  },
  handlePlayerSubmit: function() {
    if(this.state.playerButtonName === 'play') {
      var timer = setInterval(this.play, 100);
      var now = new Date();
      this.setState({
        startPlay: now.getTime(),
        playerButtonName: 'stop',
        playerTimer: timer
      }); 
    } else {
      clearInterval(this.state.playerTimer);
      this.setState({
        playerButtonName: 'play',
        playerTimer: undefined
      }); 
    }
    return;
  },
  handleRecoderSubmit: function() {
    if(this.state.recoderButtonName === 'rec') {
      var now = new Date();
      this.setState({
        startRec: now.getTime(),
        recoderButtonName: 'stop'
      }); 
    } else {
      this.setState({
        recoderButtonName: 'rec'
      }); 
    }
    return;
  },
  getInitialState: function() {
    return {
      data: [],
      playerTime: 0,
      playerButtonName: 'play',
      recoderButtonName: 'rec',
      selectedTape: '1',
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
        <PlayerForm buttonName={this.state.playerButtonName} onPlayerSubmit={this.handlePlayerSubmit} />
        <PlayerTimer time={this.state.playerTime} />
        <CommentList data={this.state.data} />
        <TapeForm selectedTape={this.state.selectedTape} onTapeChange={this.handleTapeChange} />
        <RecoderForm buttonName={this.state.recoderButtonName} onRecoderSubmit={this.handleRecoderSubmit} />
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

var PlayerTimer = React.createClass({
  render: function() {
    var time = this.props.time / 1000;
    return (
      <div className="playerTimer">
        {time}sec
      </div>
    );
  }
});

var PlayerForm = React.createClass({

  handleSubmit(e) {
    e.preventDefault();
    this.props.onPlayerSubmit();
    return false;
  },
  render : function() {
    return (
      <form className="playerForm" onSubmit={this.handleSubmit}>
        <input type="submit" value={this.props.buttonName} />
      </form>
    );
  }
});



var RecoderForm = React.createClass({

  handleSubmit(e) {
    e.preventDefault();
    this.props.onRecoderSubmit();
    return false;
  },
  render : function() {
    return (
      <form className="recoderForm" onSubmit={this.handleSubmit}>
        <input type="submit" value={this.props.buttonName} />
      </form>
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
        <span className="postedTime"> {this.props.posted_time} </span>
        <span className="author"> {this.props.author} </span>
        <span className="text" dangerouslySetInnerHTML={{__html: rawMarkup}} />
      </div>
    );
  }
});

