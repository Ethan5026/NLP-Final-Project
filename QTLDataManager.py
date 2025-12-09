import json
import re
import urllib
import pandas as pd


class QTLDataManager:
    def __init__(self, base_url="http://eutils.ncbi.nlm.nih.gov/entrez/eutils/", db_name="db=pubmed"):
        self.base_url = base_url
        self.db_name = db_name

        dict_file_path = 'Trait_dictionary.txt'
        self.traits_dict = []
        try:
            with open(dict_file_path) as fh:
                for line in fh:
                    self.traits_dict.append(line.replace('\n', '').lower())
        except FileNotFoundError:
            print(f"Error: The file '{dict_file_path}' was not found.")
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON from '{dict_file_path}': {e}")
        except Exception as e:
            print(f"An unexpected error occurred: {e}")

        training_data = pd.read_json("QTL_text.json")
        testing_data = pd.read_csv("QTL_test_unlabeled.tsv", sep="\t")
        self.training_data = pd.concat([training_data, testing_data], ignore_index=True)

    def fetch_data(self, query, retmax=100):
        """Fetch data from NCBI Entrez database."""
        query_url = f"{self.base_url}esearch.fcgi?{self.db_name}&term={query}&retmax={retmax}&usehistory=y&rettype=json"
        f = urllib.request.urlopen(query_url)
        data = f.read().decode('utf-8')

        # obtain webenv and querykey settings for efetch command
        fetch_webenv = "&WebEnv=" + re.findall("<WebEnv>(\S+)</WebEnv>", data)[0]
        fetch_querykey = "&query_key=" + re.findall("<QueryKey>(\d+?)</QueryKey>", data)[0]

        #Get clean title/abstract
        query_url = f"{self.base_url}efetch.fcgi?{self.db_name}{fetch_webenv}{fetch_querykey}&retmode=text&rettype=abstract&retmax={retmax}"
        f = urllib.request.urlopen(query_url)
        data = f.read().decode('utf-8')
        title = data.split('\n\n')[1]
        abstract = data.split('\n\n')[4].replace('\n', '')

        #Get traits found within it
        title_matches = []
        abstract_matches = []
        lower_title = title.lower().replace('\n','')
        lower_abstract = abstract.lower().replace('\n','')
        for trait in self.traits_dict:
            pattern = rf"(?<![A-Za-z0-9]){re.escape(trait)}(?![A-Za-z0-9])"
            title_matches.extend([{"Trait_Type": "dict_Trait", "Starting_Index": m.start(), "Ending_Index": m.end(), "Word": m.group()} for m in re.finditer(pattern, lower_title)])
            abstract_matches.extend([{"starting_index": m.start(), "ending_index": m.end(), "trait": m.group()} for m in re.finditer(pattern, lower_abstract)])


        return {"PMID": query, "Title": title.replace('\n',''), "Abstract": abstract.replace('\n',''), "Title_Traits": title_matches, "Abstract_Traits": abstract_matches}


if __name__ == "__main__":
    qtl_manager = QTLDataManager()
    query = "34902587"
    data = qtl_manager.fetch_data(query)
    print(data)
