var CommentBox = React.createClass({

  loadCommentsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      success: function(result) {
        this.setState({originComments: result.data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleStyleChange: function(e) {
    this.setState({
      commentStyle: e.target.value
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
        this.setState({originComments: this.state.originComments.concat([data])});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  updateCommentList: function(time) {
    this.setState({
      playerTime: time,
      viewComments: this.state.originComments.filter(function(v) { return (v.posted_time < time) })
    });
  },
  play: function() {
    var playerTime = this.state.playerTime + this.state.playerInterval;
    this.updateCommentList(playerTime);
  },
  handlePlayerReset: function() {
    this.updateCommentList(0);
  },
  handlePlayerSubmit: function() {
    if(this.state.playerButtonName === 'play') {
      var timer = setInterval(this.play, this.state.playerInterval);
      this.setState({
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
      originComments: [],
      viewComments: [],
      styles: [{name: 'line'}],
      commentStyle: 'line',
      playerTime: 0,
      playerInterval: 10,
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
        <StyleForm selectedStyle={this.state.commentStyle} onStyleChange={this.handleStyleChange} />
        <PlayerForm buttonName={this.state.playerButtonName} onPlayerSubmit={this.handlePlayerSubmit} onPlayerReset={this.handlePlayerReset} />
        <PlayerTimer time={this.state.playerTime} />
        <CommentList data={this.state.viewComments} style={this.state.commentStyle} />
        <TapeForm selectedTape={this.state.selectedTape} onTapeChange={this.handleTapeChange} />
        <RecoderForm buttonName={this.state.recoderButtonName} onRecoderSubmit={this.handleRecoderSubmit} />
        <CommentForm onCommentSubmit={this.handleCommentSubmit} />
      </div>
    );
  }
});

var CommentList = React.createClass({

  render: function() {
    var styles = {
      line: 'commentListLineStyle',
      twitter: 'commentListTwitterStyle'
    };
    var mainClassName = "commentList " + styles[this.props.style];
    
    var commentNodes = this.props.data.map(function (comment) {
      var posted_time = comment.posted_time / 1000;
      return (
        <Comment key={comment.id} tape_id={comment.tape_id} author={comment.author} posted_time={posted_time} text={comment.text} sytle={this.props.style}>
          {comment.text}
        </Comment>
      );
    }, this);
    return (
      <div className={mainClassName}>
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
  handleReset(e) {
    e.preventDefault();
    this.props.onPlayerReset();
    return false;
  },
  render : function() {
    return (
      <form className="playerForm" onSubmit={this.handleSubmit}>
        <input type="submit" value={this.props.buttonName} />
        <input type="button" value="reset" onClick={this.handleReset} />
      </form>
    );
  }
});

var StyleForm = React.createClass({

  handleChange(e) {
    this.props.onStyleChange(e);
  },
  render : function() {
    return (
      <form className="styleForm">
        <input type="radio" name="style" checked={this.props.selectedStyle === "line"} onChange={this.handleChange} value="line" /><span>line</span>
        <input type="radio" name="style" checked={this.props.selectedStyle === "twitter"} onChange={this.handleChange} value="twitter" /><span>twitter</span>
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
    var styles = {
      line: "commentLineStyle",
      twitter: "commentTwitterStyle",
    };
    var mainClassName = "comment " + styles[this.props.style];
    
    //var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
        //<span className="text" dangerouslySetInnerHTML={{__html: rawMarkup}} />
    return (
      <div className={mainClassName}>
        <div className="inner">
          <div className="info">
            tape: <span className="tape">{this.props.tape_id}</span>
            posted_time: <span className="postedTime">{this.props.posted_time}</span>sec
          </div>
          <div className="main">
            <span className="author">{this.props.author}</span>:<span className="text">{this.props.text}</span>
          </div>
        </div>
      </div>
    );
  }
});

