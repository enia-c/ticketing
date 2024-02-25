--------------------------------------
#ticketingサービスの起動
minikube start
skaffold dev
sudo ssh -N -i $(minikube ssh-key) -L 80:localhost:80 docker@$(minikube ip)


#natsのポートフォーワード
kubectl get pods
#natsのポートにフォワード
kubectl port-forward nats-depl-87c59d478-tppxh 4222:4222

