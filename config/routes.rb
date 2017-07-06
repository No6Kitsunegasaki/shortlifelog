Rails.application.routes.draw do
  get 'notes/write'
  get 'notes/edit'

  namespace :api, format: 'json' do
    namespace :v1 do
      resources :comments
    end
  end
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end

