Rails.application.routes.draw do
  root 'pages#home'


  resources :users, only: %i[new create]
  resources :dashboard, only: %i[index]
  resources :library, only: %i[index]
  resources :paints, only: %i[index]
  resources :paints do
    collection { post :import }
  end

  get 'dashboard', to: 'dashboard#index', as: 'dashboard'
  get "dashboard/search_paints", to: "dashboard#search_paints"
  post 'dashboard/upload_images', to: 'dashboard#upload_images', as: 'upload_images_dashboard'
  post "dashboard/color_change", to: "dashboard#color_change", as: "color_change_dashboard"
  delete 'dashboard/delete_image/:id', to: 'dashboard#delete_image', as: 'delete_image_dashboard'
  get 'login', to: 'sessions#new'
  post 'login', to: 'sessions#create'
  delete 'logout', to: 'sessions#destroy'

  get "up" => "rails/health#show", as: :rails_health_check

end
