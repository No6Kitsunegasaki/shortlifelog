class Api::V1::CommentsController < ApplicationController

  def index
    @data = Comment.all.order("posted_time")
  end

  def create
    @comment = Comment.create(comment_params)
    render :show, status: :created
  end

  def comment_params
    params.permit(:tape_id, :author, :text, :posted_time)
  end

end
