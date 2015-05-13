__author__ = 'Joseph DiLallo'
from googleads import adwords
from googleads import oauth2
# OAuth 2.0 credential information. In a real application, you'd probably be
# pulling these values from a credential storage.
CLIENT_ID = '86047424703-n2avdr6a9n1itlj577411oismqucakig.apps.googleusercontent.com'
CLIENT_SECRET = 'mMkAP781gFa7xMTeKHSE33nn'
REFRESH_TOKEN = '1/R7iVS8hVf_OD37EO40xvMtzJERwbXXY5Q-VNRmi8NeUMEudVrK5jSpoR30zcRFq6'
# AdWords API information.
DEVELOPER_TOKEN = 'uIbr_0yYmS4qelpS2QEMEg'
USER_AGENT = 'My Adwords API Project'
CLIENT_CUSTOMER_ID = '869-227-2751'
def main(client_id, client_secret, refresh_token, developer_token, user_agent, client_customer_id):
	oauth2_client = oauth2.GoogleRefreshTokenClient(
	client_id, client_secret, refresh_token)
	adwords_client = adwords.AdWordsClient(
	developer_token, oauth2_client, user_agent, client_customer_id)
	customer = adwords_client.GetService('CustomerService').get()
	print 'You are logged in as customer: %s' % customer['customerId']

if __name__ == '__main__':
	main(CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, DEVELOPER_TOKEN, USER_AGENT, CLIENT_CUSTOMER_ID) 
