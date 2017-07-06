var EditBox = React.createClass({

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
    var selectedTapes = this.state.playerTapeBoxs.filter(function(tape) {
      return tape.selected;
    }).map(function(tape) {return tape.num});
    this.setState({
      playerTime: time,
      viewComments: this.state.originComments.filter(function(v) {
        return (v.posted_time < time && (selectedTapes.indexOf(v.tape_id) >= 0))
      })
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
  handlePlayerTapeChange: function(num) {
    console.log(num);
    var nextState = this.state.playerTapeBoxs.map(function(tape) {
      return {
        num: tape.num,
        selected: (tape.num === num ? !tape.selected : tape.selected)
      };
    });
    this.setState({playerTapeBoxs: nextState});
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
    var tapeNumbers = [1,2,3,4,5,6];
    var playerTapeBoxs = tapeNumbers.map(function(num) {
      return {num: num, selected: false};
    });
    return {
      originComments: [],
      viewComments: [],
      styles: [{name: 'line'}],
      commentStyle: 'line',
      playerTime: 0,
      playerInterval: 10,
      playerButtonName: 'play',
      playerTapeBoxs: playerTapeBoxs,
      recoderButtonName: 'rec',
      selectedTape: '1',
      tapeNumbers: tapeNumbers,
    };
  },
  componentDidMount: function() {
    this.loadCommentsFromServer();
    //setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className="editBox">
        <h2>edit comment</h2>
        <StyleForm selectedStyle={this.state.commentStyle} onStyleChange={this.handleStyleChange} />
        <PlayerForm buttonName={this.state.playerButtonName} onPlayerSubmit={this.handlePlayerSubmit} onPlayerReset={this.handlePlayerReset} />
        <PlayerTapeForm tapeBoxs={this.state.playerTapeBoxs} onTapeChange={this.handlePlayerTapeChange} />
        <PlayerTimer time={this.state.playerTime} />
        <CommentList data={this.state.viewComments} style={this.state.commentStyle} />
        <TapeForm tapeNumbers={this.state.tapeNumbers} selectedTape={this.state.selectedTape} onTapeChange={this.handleTapeChange} />
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
      twitter: 'commentListTwitterStyle',
      lifeline: 'commentListLifeLineStyle',
    };
    var mainClassName = "commentList " + styles[this.props.style];
    
    var commentNodes = this.props.data.map(function (comment) {
      var posted_time = comment.posted_time / 1000;
      return (
        <Comment key={comment.id} tape_id={comment.tape_id} author={comment.author} posted_time={posted_time} text={comment.text} style={this.props.style}>
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

var PlayerTapeForm = React.createClass({

  handleChange(num) {
    this.props.onTapeChange(num);
  },
  render : function() {
    var tape_boxs = this.props.tapeBoxs.map(function(tape) {
      return (
        <div>
          <input type="checkbox" checked={tape.selected} onChange={this.handleChange.bind(this, tape.num)} />
          tape_{tape.num}
        </div>
      );
    }.bind(this));

    return (
      <form>
        {tape_boxs}
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
        <input type="radio" name="style" checked={this.props.selectedStyle === "lifeline"} onChange={this.handleChange} value="lifeline" /><span>lifeline</span>
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
    var tape_htmls = this.props.tapeNumbers.map(function(num) {
      return (
        <li>
          <label>
            <input type="radio" value={num} checked={this.props.selectedTape == num} onChange={this.props.onTapeChange} />
            tape_{num}
          </label>
        </li>
      );
    }.bind(this));

    return (
      <form>
        <ul>
          {tape_htmls}
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
    var posted_time = this.refs.postedTime.value.trim();
    if (!text || !author || !posted_time || isNaN(posted_time)) {
      return;
    }
    this.props.onCommentSubmit({author: author, text: text, posted_time: posted_time});
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
          <li>
            <input type="text" placeholder="posted time(ms)" ref="postedTime" />
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
    var inner = (this.props.author === 'B') ? "inner right" : "inner";
    var mainClassName = "comment " + styles[this.props.style];
    var result = (
      <div className="comment commentLineStyle">
        <div className={inner}>
          <div className="info">
            tape: <span className="tape">{this.props.tape_id}</span>
            posted_time: <span className="postedTime">{this.props.posted_time}</span>sec
          </div>
          <div className="main">
            <span className="text">{this.props.text}</span>
          </div>
        </div>
      </div>
    );

    if(this.props.style === "twitter") {
      result = (
        <div className="comment commentTwitterStyle">
          <div className="inner">
            <div className="info">
              <span className="author info-child">{this.props.author}</span>
              <span className="info-child">tape: <span className="tape_id">{this.props.tape_id}</span></span>
              <span className="info-child">posted_time: <span className="postedTime">{this.props.posted_time}</span>sec</span>
            </div>
            <div className="main">
              <span className="text">{this.props.text}</span>
            </div>
          </div>
        </div>
      );
    } else if(this.props.style === 'lifeline') {
      var commentStyle = '';
      if(this.props.author === 'base') {
        commentStyle = 'base';
      }
      var textStyle = "text " + commentStyle;
      result = (
        <div className="comment commentLifeLineStyle">
          <div className="inner">
            <div className="info">
              <span className="author info-child">{this.props.author}</span>
              <span className="info-child">tape: <span className="tape_id">{this.props.tape_id}</span></span>
              <span className="info-child">posted_time: <span className="postedTime">{this.props.posted_time}</span>sec</span>
            </div>
            <div className="main">
              <span className={textStyle}>{this.props.text}</span>
            </div>
          </div>
        </div>
      );
    }
    return result;
  }
});

