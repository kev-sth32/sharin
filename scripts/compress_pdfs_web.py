import os
import glob
import subprocess
import shutil

uploads_dir = '/home/admin/tripnaari/app/public/uploads'
backup_dir = '/home/admin/tripnaari/uploads_pdf_originals_backup'
os.makedirs(backup_dir, exist_ok=True)

pdfs = glob.glob(os.path.join(uploads_dir, '*.pdf'))
print(f"Found {len(pdfs)} total PDFs in uploads.")

initial_total = 0
final_total = 0

for pdf in sorted(pdfs):
    sz = os.path.getsize(pdf)
    initial_total += sz
    fname = os.path.basename(pdf)

    # Only compress PDFs larger than 1MB
    if sz > 1024 * 1024:
        # Backup original
        backup_path = os.path.join(backup_dir, fname)
        if not os.path.exists(backup_path):
            shutil.copy2(pdf, backup_path)

        tmp_out = pdf + '.screen.pdf'
        cmd = [
            'gs',
            '-sDEVICE=pdfwrite',
            '-dCompatibilityLevel=1.4',
            '-dPDFSETTINGS=/screen',
            '-dNOPAUSE',
            '-dQUIET',
            '-dBATCH',
            f'-sOutputFile={tmp_out}',
            pdf
        ]
        
        try:
            res = subprocess.run(cmd, timeout=180, capture_output=True)
            if res.returncode == 0 and os.path.exists(tmp_out):
                new_sz = os.path.getsize(tmp_out)
                if 0 < new_sz < sz:
                    os.replace(tmp_out, pdf)
                    final_total += new_sz
                    savings = 100 - (new_sz / sz) * 100
                    print(f"[OK] {fname}: {sz/(1024*1024):.2f}MB -> {new_sz/(1024*1024):.2f}MB (-{savings:.1f}%)")
                else:
                    if os.path.exists(tmp_out): os.remove(tmp_out)
                    final_total += sz
                    print(f"[SKIP] {fname}: {sz/(1024*1024):.2f}MB (no reduction)")
            else:
                if os.path.exists(tmp_out): os.remove(tmp_out)
                final_total += sz
                print(f"[FAIL] {fname}: compression failed, kept original")
        except Exception as e:
            if os.path.exists(tmp_out): os.remove(tmp_out)
            final_total += sz
            print(f"[ERR] {fname}: {e}")
    else:
        final_total += sz

saved_mb = (initial_total - final_total) / (1024 * 1024)
print("\n=== COMPRESSION SUMMARY ===")
print(f"Initial PDF Total: {initial_total/(1024*1024):.2f} MB")
print(f"Final PDF Total:   {final_total/(1024*1024):.2f} MB")
if initial_total > 0:
    pct = 100 - (final_total / initial_total) * 100
    print(f"Total Space Saved: {saved_mb:.2f} MB (-{pct:.1f}%)")
