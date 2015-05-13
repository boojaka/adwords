__author__ = ('api.kwinter@gmail.com (Kevin Winter)'
							'Joseph DiLallo')
import logging
from googleads import oauth2
from googleads import adwords


PAGE_SIZE = 1
CLIENT_ID = '86047424703-n2avdr6a9n1itlj577411oismqucakig.apps.googleusercontent.com'
CLIENT_SECRET = 'mMkAP781gFa7xMTeKHSE33nn'
REFRESH_TOKEN = '1/R7iVS8hVf_OD37EO40xvMtzJERwbXXY5Q-VNRmi8NeUMEudVrK5jSpoR30zcRFq6'
# AdWords API information.
DEVELOPER_TOKEN = 'uIbr_0yYmS4qelpS2QEMEg'
USER_AGENT = 'My Adwords API Project'
CLIENT_CUSTOMER_ID = '869-227-2751'

def main(client):
	# Initialize appropriate service.
	targeting_idea_service = client.GetService(
			'TargetingIdeaService', version='v201502')

	# Construct selector object and retrieve related keywords.
	offset = 0
	selector = {
			'searchParameters': [
					{
							'xsi_type': 'RelatedToQuerySearchParameter',
							'queries': ['buy flowers','big flowers']
					},
					{
							# Language setting (optional).
							# The ID can be found in the documentation:
							#	https://developers.google.com/adwords/api/docs/appendix/languagecodes
							'xsi_type': 'LanguageSearchParameter',
							'languages': [{'id': '1000'}]
					},
					{
							'xsi_type': 'CompetitionSearchParameter',
							'levels': ['HIGH']
					},
					{
							'xsi_type': 'LocationSearchParameter',
							'locations': [
								{
									'id':'1012852',
								}
							]							
					}
			],
			'ideaType': 'KEYWORD',
			'requestType': 'IDEAS',
			'requestedAttributeTypes': ['KEYWORD_TEXT', 'SEARCH_VOLUME',
																	'CATEGORY_PRODUCTS_AND_SERVICES','AVERAGE_CPC','TARGETED_MONTHLY_SEARCHES'],
			'paging': {
					'startIndex': str(offset),
					'numberResults': str(PAGE_SIZE)
			}
	}
	more_pages = True
	while more_pages:
		page = targeting_idea_service.get(selector)

		# Display results.
		if 'entries' in page:
			for result in page['entries']:
				attributes = {}
				for attribute in result['data']:
					attributes[attribute['key']] = getattr(attribute['value'], 'value',
																								 '0')
				print ('Keyword with \'%s\' text and average monthly search volume '
							 '\'%s\' was found with Products and Services categories: %s.'
							 % (attributes['KEYWORD_TEXT'],
									attributes['SEARCH_VOLUME'],
									attributes['CATEGORY_PRODUCTS_AND_SERVICES']))
			print
		else:
			print 'No related keywords were found.'
		offset += PAGE_SIZE
		selector['paging']['startIndex'] = str(offset)
		more_pages = 0 # offset < int(page['totalNumEntries'])


if __name__ == '__main__':
	# Initialize client object.
	logging.basicConfig(level=logging.INFO)
	logging.getLogger('suds.transport').setLevel(logging.DEBUG)
	oauth2_client = oauth2.GoogleRefreshTokenClient(
	CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN)
	adwords_client = adwords.AdWordsClient(
	DEVELOPER_TOKEN, oauth2_client, USER_AGENT, CLIENT_CUSTOMER_ID)

	main(adwords_client)
