from pedalboard import Pedalboard, Chorus, Reverb
from pedalboard.io import AudioFile

# Read in a whole audio file:
with AudioFile('some-file.wav', 'r') as f:
  audio = f.read(f.frames)
  samplerate = f.samplerate

# Make a Pedalboard object, containing multiple plugins:
# board = Pedalboard([Reverb(room_size=0.25)])
board = Pedalboard([Chorus(),Chorus(),Chorus()])

# Run the audio through this pedalboard!
effected = board(audio, samplerate)

# Write the audio back as a wav file:
with AudioFile('processed-output5.wav', 'w', samplerate, effected.shape[0]) as f:
  f.write(effected)
