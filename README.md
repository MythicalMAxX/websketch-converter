# WebSketch-Converter
This Flask application allows users to upload an image and receive a code snippet that describes the image. The code snippet is generated using the LangChain library and the Gemini API.
-
Clone the repository:

```git clone https://github.com/MythicalMAxX/websketch-converter.git```
-
Install the required packages:

```pip install -r requirements.txt```
-
Set your Gemini API key:

```export GOOGLE_API_KEY="your-api-key"```
or simply add your key in main.py


You can obtain your Gemini API key from https://g.co/ai/idxGetGeminiKey.
-
Run the application:

```python main.py```
-
The application will be available at http://localhost:5000.

Open the application in your browser:

```http://localhost:5000```
-
Click the "Choose File" button and select an image.

Click the "Generate Code" button.

The code snippet will be displayed below the image.
-
Contributions are welcome!
