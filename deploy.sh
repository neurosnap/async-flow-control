printer(){
	printf '\n' && printf '=%.0s' {1..40} && printf '\n'
	echo $1
	printf '=%.0s' {1..40} && printf '\n'
}

printer "Running gulp ..."
gulp

printer "Restarting afc ..."
supervisorctl restart afc