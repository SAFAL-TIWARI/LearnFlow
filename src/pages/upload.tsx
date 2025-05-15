import { useState } from 'react'
import { supabase } from '../../supabaseClient'

export default function Upload() {
const [file, setFile] = useState<File>()

const uploadFile = async () => {
if (!file) return
const { data, error } = await supabase.storage.from('resources').upload(uploads/${file.name}, file)
if (error) alert(error.message)
else alert('Upload successful!')
}

return (
<div>
<input type="file" onChange={(e) => setFile(e.target.files?.[0])} />
<button onClick={uploadFile}>Upload</button>
</div>
)
}