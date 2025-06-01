import pandas as pd
import openpyxl
from io import BytesIO


def export_records_to_excel (dictonary):
    # Convert the list of dictionaries into a pandas DataFrame
    df = pd.DataFrame(dictonary)

    # Save DataFrame to an in-memory Excel file
    excel_file = BytesIO()
    df.to_excel(excel_file, index=False, engine='openpyxl')

    # Move the cursor to the beginning of the BytesIO buffer
    excel_file.seek(0)

    # Send the file to the user as a download
    return excel_file
