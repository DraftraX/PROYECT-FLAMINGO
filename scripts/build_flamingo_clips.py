#!/usr/bin/env python3
"""Create H.264 web clips from Flamingo's own DJI footage and panoramas.

No AI imagery is generated. The source video is the publicly shared file
15AJ3FSxGAk4KzwF51p5LDGwrBdPeyJk5. Requires OpenCV with avc1 encoder.
Cisco OpenH264 2.5.0 can be placed in assets-input from the official URL:
https://ciscobinary.openh264.org/openh264-2.5.0-win64.dll.bz2
"""
from pathlib import Path
import os, json, struct, sys, subprocess, shutil

ROOT=Path(__file__).resolve().parents[1]
os.environ['PATH']=str(ROOT/'assets-input')+os.pathsep+os.environ.get('PATH','')
import cv2
from PIL import Image
from import_drive_assets import perspective

OUT=ROOT/'public/media/flamingo'
SOURCE=ROOT/'assets-input/drive-previews/source-drone.mp4'

def optimize(path):
    """Prefer the optional local ffmpeg bundle for small mobile-ready delivery."""
    executable=shutil.which('ffmpeg')
    local=ROOT/'assets-input/video-tools'
    if not executable and local.exists():
        sys.path.insert(0,str(local))
        import imageio_ffmpeg
        executable=imageio_ffmpeg.get_ffmpeg_exe()
    if executable:
        temporary=path.with_name(path.stem+'-optimized.mp4')
        subprocess.run([executable,'-hide_banner','-loglevel','error','-y','-i',str(path),'-an','-c:v','libx264','-preset','fast','-crf','25','-pix_fmt','yuv420p','-movflags','+faststart',str(temporary)],check=True)
        temporary.replace(path)
    else:
        faststart(path)

def atoms(data,start=0,end=None):
    end=len(data) if end is None else end
    while start+8<=end:
        size,kind=struct.unpack_from('>I4s',data,start)
        header=8
        if size==1:
            size=struct.unpack_from('>Q',data,start+8)[0]
            header=16
        if size==0: size=end-start
        if size<header or start+size>end: break
        yield start,size,kind,header
        start+=size

def faststart(path):
    """Move MP4 moov before mdat and update chunk offsets for progressive playback."""
    data=path.read_bytes()
    top=list(atoms(data))
    moov=next(a for a in top if a[2]==b'moov')
    mdat=next(a for a in top if a[2]==b'mdat')
    if moov[0]<mdat[0]:return
    atom=bytearray(data[moov[0]:moov[0]+moov[1]])
    def update(start,end):
        for pos,size,kind,head in atoms(atom,start,end):
            if kind in [b'moov',b'trak',b'mdia',b'minf',b'stbl']:
                update(pos+head,pos+size)
            elif kind in [b'stco',b'co64']:
                count=struct.unpack_from('>I',atom,pos+head+4)[0]
                fmt='>I' if kind==b'stco' else '>Q'
                step=4 if kind==b'stco' else 8
                for i in range(count):
                    offset=pos+head+8+i*step
                    value=struct.unpack_from(fmt,atom,offset)[0]
                    if mdat[0]<=value<moov[0]: value+=moov[1]
                    struct.pack_into(fmt,atom,offset,value)
    update(0,len(atom))
    result=bytearray()
    for pos,size,kind,head in top:
        if kind==b'moov':continue
        if kind==b'mdat':result.extend(atom)
        result.extend(data[pos:pos+size])
    path.write_bytes(result)

def writer(ident):
    path=OUT/f'{ident}.mp4'
    handle=cv2.VideoWriter(str(path),cv2.VideoWriter_fourcc(*'avc1'),24,(1920,1080))
    if not handle.isOpened():raise RuntimeError('H.264 encoder unavailable; install official Cisco OpenH264 2.5.0 locally in assets-input')
    return handle,path

def source_clip(ident,start,duration):
    source=cv2.VideoCapture(str(SOURCE))
    if not source.isOpened():raise RuntimeError('Original Drive video missing or unreadable')
    source_fps=source.get(cv2.CAP_PROP_FPS)
    output,path=writer(ident)
    first=last=None
    source.set(cv2.CAP_PROP_POS_FRAMES,round(start*source_fps))
    decoded_frame=round(start*source_fps)-1
    for frame_no in range(round(duration*24)):
        target=round((start+frame_no/24)*source_fps)
        while decoded_frame<target:
            ok,frame=source.read()
            decoded_frame+=1
            if not ok:raise RuntimeError(f'Cannot decode source at {start+frame_no/24}')
        frame=cv2.resize(frame,(1920,1080),interpolation=cv2.INTER_AREA)
        output.write(frame)
        first=frame if first is None else first
        last=frame
    output.release()
    source.release()
    for suffix,frame in [('poster',first),('end',last)]:
        Image.fromarray(cv2.cvtColor(frame,cv2.COLOR_BGR2RGB)).save(OUT/f'{ident}-{suffix}.webp','WEBP',quality=86)
    optimize(path)
    print(f'CLIP {ident} {path.stat().st_size} bytes',flush=True)
    return {'id':ident,'label':'Ingreso real por el pórtico' if ident=='entry-flight' else 'Vuelo real hacia el parque', 'kind':'video',
      'src':f'/media/flamingo/{ident}.mp4','poster':f'/media/flamingo/{ident}-poster.webp','endPoster':f'/media/flamingo/{ident}-end.webp',
      'thumbnail':f'/media/flamingo/{ident}-poster.webp','sourceDriveId':'15AJ3FSxGAk4KzwF51p5LDGwrBdPeyJk5','duration':duration,'width':1920,'height':1080,'fps':24,
      'derivation':f'Actual DJI footage; source range {start:.1f}–{start+duration:.1f}s; resized to 1080p24, H.264 fast-start. No AI generation.'}

def panorama_clip():
    ident='panorama-flight'
    image=Image.open(OUT/'panorama-01.webp')
    output,path=writer(ident)
    for frame_no in range(144):
        t=frame_no/143
        eased=t*t*(3-2*t)
        view=perspective(image,yaw=-8+16*eased,pitch=-24,hfov=94-8*eased)
        output.write(cv2.cvtColor(__import__('numpy').asarray(view),cv2.COLOR_RGB2BGR))
    output.release()
    optimize(path)
    print(f'CLIP {ident} {path.stat().st_size} bytes',flush=True)
    return {'id':ident,'label':'Mirador aéreo panorámico','kind':'video','src':f'/media/flamingo/{ident}.mp4','poster':'/media/flamingo/view-01.webp','thumbnail':'/media/flamingo/panorama-01-thumb.webp','sourceDriveId':'10vBa5Fx8ryDeCLNyeVk8waDGezU9zZ-h','duration':6,'width':1920,'height':1080,'fps':24,'derivation':'Mathematical rectilinear pan and zoom inside the real panorama. No spatial camera translation and no AI generation.'}

def main():
    clips=[source_clip('entry-flight',0,6),source_clip('tour-01',6,6),source_clip('tour-02',9.3,6),panorama_clip()]
    manifest=OUT/'assets.json'
    assets=[a for a in json.loads(manifest.read_text(encoding='utf8')) if a['kind']!='video']
    manifest.write_text(json.dumps(assets+clips,ensure_ascii=False,indent=2),encoding='utf8')
    (ROOT/'src/data/media-assets.json').write_text(json.dumps(assets+clips,ensure_ascii=False,indent=2),encoding='utf8')

if __name__=='__main__':main()
